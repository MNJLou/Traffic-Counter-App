export async function onRequestGet(context: any) {
  const workerUrl = 'https://traffic-counter-api-worker.jeromelou502.workers.dev/health'
  
  try {
    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
