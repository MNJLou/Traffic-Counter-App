/**
 * Cloudflare Worker - Traffic Counter API
 * 
 * Deploy this to Cloudflare Workers to handle:
 * - Authentication
 * - Traffic count storage
 * - Data sync every 15 minutes
 */

export interface Env {
  DB: D1Database
  JWT_SECRET: string
}

interface TrafficRequest {
  in: number
  out: number
}

// Mock authentication (replace with your actual auth)
async function authenticateRequest(request: Request, env: Env): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.slice(7)
  // Validate JWT token here
  // For now, just verify it exists
  return token ? 'user-id' : null
}

// DEV ONLY: Test credentials (replace with real auth in production)
const DEV_CREDENTIALS = {
  'admin@test.com': 'password123',
  'staff@test.com': 'password123'
}

// Login endpoint
export async function handleLogin(request: Request, env: Env) {
  const { email, password } = await request.json()
  
  // DEV: Check against test credentials
  if (DEV_CREDENTIALS[email as keyof typeof DEV_CREDENTIALS] === password) {
    // Generate simple JWT token (DEV ONLY)
    const now = Math.floor(Date.now() / 1000)
    const exp = now + (7 * 24 * 60 * 60) // 7 days
    const token = btoa(JSON.stringify({ email, exp, iat: now }))
    
    return new Response(JSON.stringify({
      token,
      user: {
        id: email === 'admin@test.com' ? 'admin-1' : 'staff-1',
        email,
        name: email === 'admin@test.com' ? 'Admin User' : 'Staff Member'
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  
  return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
    status: 401, 
    headers: { 'Content-Type': 'application/json' } 
  })
}

// Get today's count
export async function getCountToday(location: string, env: Env) {
  const today = new Date().toISOString().split('T')[0]
  
  const result = await env.DB.prepare(
    'SELECT in_count, out_count FROM traffic WHERE location = ? AND date = ?'
  ).bind(location, today).first()
  
  return {
    in: result?.in_count || 0,
    out: result?.out_count || 0,
    timestamp: new Date().toISOString()
  }
}

// Update count
export async function updateCount(location: string, data: TrafficRequest, env: Env) {
  const today = new Date().toISOString().split('T')[0]
  
  await env.DB.prepare(
    `INSERT INTO traffic (location, date, in_count, out_count, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(location, date) DO UPDATE SET
     in_count = excluded.in_count,
     out_count = excluded.out_count,
     updated_at = datetime('now')`
  ).bind(location, today, data.in, data.out).run()
  
  return {
    in: data.in,
    out: data.out,
    timestamp: new Date().toISOString()
  }
}

// Get history
export async function getHistory(location: string, days: number, env: Env) {
  const result = await env.DB.prepare(
    `SELECT date, in_count, out_count FROM traffic
     WHERE location = ? AND date >= date('now', '-' || ? || ' days')
     ORDER BY date DESC`
  ).bind(location, days).all()
  
  return result.results
}

// Scheduled handler for 15-minute sync
export async function handleScheduled(event: ScheduledEvent, env: Env) {
  console.log('Running 15-minute traffic sync...')
  
  // Aggregate data and store in long-term storage
  const result = await env.DB.prepare(
    `SELECT location, SUM(in_count) as total_in, SUM(out_count) as total_out
     FROM traffic
     WHERE updated_at > datetime('now', '-15 minutes')
     GROUP BY location`
  ).all()
  
  // Process and store aggregated data
  for (const row of result.results) {
    console.log(`Location: ${row.location}, In: ${row.total_in}, Out: ${row.total_out}`)
  }
}

// Main router
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method

    // Authenticate all routes except login
    if (!pathname.includes('/auth/login')) {
      const userId = await authenticateRequest(request, env)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      }
    }

    // Authentication routes
    if (pathname === '/auth/login' && method === 'POST') {
      return await handleLogin(request, env)
    }

    // Traffic routes
    if (pathname.match(/^\/traffic\/[^/]+\/today$/) && method === 'GET') {
      const location = pathname.split('/')[2]
      const data = await getCountToday(location, env)
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    }

    if (pathname.match(/^\/traffic\/[^/]+\/update$/) && method === 'POST') {
      const location = pathname.split('/')[2]
      const data = await request.json()
      const result = await updateCount(location, data, env)
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    }

    if (pathname.match(/^\/traffic\/[^/]+\/history/) && method === 'GET') {
      const location = pathname.split('/')[2]
      const days = parseInt(url.searchParams.get('days') || '7')
      const data = await getHistory(location, days, env)
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  },

  async scheduled(event: ScheduledEvent, env: Env) {
    await handleScheduled(event, env)
  }
}
