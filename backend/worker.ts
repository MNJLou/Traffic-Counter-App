/**
 * Cloudflare Worker - Traffic Counter API
 * 
 * Deploy this to Cloudflare Workers to handle:
 * - Traffic session data storage
 * - Every 15 minutes, API stores the data being tracked
 */
 
export interface Env {
  DB: D1Database
}
 
interface TrafficData {
  name: string
  session: string
  location: string
  customer_in: number
  customer_out: number
  out_with_bags: number
  notes?: string
}
 
// Submit session data
export async function submitSessionData(data: TrafficData, env: Env) {
  try {
    const result = await env.DB.prepare(
      `INSERT INTO traffic_sessions (name, session, location, customer_in, customer_out, out_with_bags, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.name,
      data.session,
      data.location,
      data.customer_in,
      data.customer_out,
      data.out_with_bags,
      data.notes || null
    ).run()
    
    return {
      success: true,
      id: result.meta.last_row_id,
      message: 'Session data submitted successfully',
      data
    }
  } catch (error: any) {
    throw new Error(`Failed to insert session data: ${error.message}`)
  }
}
 
// Get session history
export async function getSessionHistory(
  location: string,
  name: string,
  limit: number = 10,
  env: Env
) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM traffic_sessions
       WHERE location = ? AND name = ?
       ORDER BY timestamp DESC
       LIMIT ?`
    ).bind(location, name, limit).all()
    
    return result.results
  } catch (error: any) {
    throw new Error(`Failed to fetch session history: ${error.message}`)
  }
}
 
// Get stats for a session
export async function getSessionStats(session: string, env: Env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        location,
        COUNT(*) as total_entries,
        SUM(customer_in) as total_in,
        SUM(customer_out) as total_out,
        SUM(out_with_bags) as total_bags
       FROM traffic_sessions
       WHERE session = ?
       GROUP BY location`
    ).bind(session).all()
    
    return result.results
  } catch (error: any) {
    throw new Error(`Failed to fetch stats: ${error.message}`)
  }
}
 
// CORS headers
function getCorsHeaders(request?: Request) {
  const allowedOrigins = [
    'https://traffic-counter-app.pages.dev',
    'http://localhost:5173'
  ]
 
  const origin = request?.headers.get('Origin') || ''
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
 
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
}
 
// Main router
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method
 
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request)
      })
    }
 
    try {
      // Submit session data
      if (pathname === '/submit' && method === 'POST') {
        const data = await request.json() as TrafficData
        
        // Validate required fields
        if (!data.name || !data.session || !data.location) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
            status: 400,
            headers: getCorsHeaders(request)
          })
        }
        
        const result = await submitSessionData(data, env)
        return new Response(JSON.stringify(result), { 
          status: 201,
          headers: getCorsHeaders(request)
        })
      }
 
      // Get session history
      if (pathname === '/history' && method === 'GET') {
        const location = url.searchParams.get('location') || 'main'
        const name = url.searchParams.get('name') || 'unknown'
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        const history = await getSessionHistory(location, name, limit, env)
        return new Response(JSON.stringify(history), { 
          headers: getCorsHeaders(request)
        })
      }
 
      // Get session stats
      if (pathname === '/stats' && method === 'GET') {
        const session = url.searchParams.get('session')
        
        if (!session) {
          return new Response(JSON.stringify({ error: 'Missing session parameter' }), { 
            status: 400,
            headers: getCorsHeaders(request)
          })
        }
        
        const stats = await getSessionStats(session, env)
        return new Response(JSON.stringify(stats), { 
          headers: getCorsHeaders(request)
        })
      }
 
      // Health check
      if (pathname === '/health' && method === 'GET') {
        return new Response(JSON.stringify({ status: 'ok' }), { 
          headers: getCorsHeaders(request)
        })
      }
 
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: getCorsHeaders(request)
      })
    } catch (error: any) {
      console.error('Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: getCorsHeaders(request)
      })
    }
  }
}