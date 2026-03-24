import { api } from '../api/cloudflareApi'

export interface TrafficData {
  name: string
  session: string
  location: string
  customer_in: number
  customer_out: number
  out_with_bags: number
  notes?: string
}

export class TrafficCounterService {
  async submitSession(data: TrafficData): Promise<any> {
  try {
    const response = await api.post('/submit', data)
    return response.data
  } catch (error: any) {
    // Log everything we can
    console.error('Full error:', error)
    console.error('Response:', error.response)
    console.error('Message:', error.message)
    
    const message = error.response?.data?.error 
      || error.message 
      || 'Unknown error'
    throw new Error(`Submit failed: ${message} (status: ${error.response?.status}, url: ${error.config?.url})`)
  }
}

  async getSessionHistory(location: string, name: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get('/history', {
        params: { location, name, limit }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch history')
    }
  }

  async getSessionStats(session: string): Promise<any[]> {
    try {
      const response = await api.get('/stats', {
        params: { session }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch stats')
    }
  }
}
