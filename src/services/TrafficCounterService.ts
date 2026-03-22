import { api } from '../api/cloudflareApi'

export interface TrafficCount {
  in: number
  out: number
  bags?: number
  timestamp?: string
}

export class TrafficCounterService {
  async getTodayCount(location: string): Promise<TrafficCount> {
    try {
      const response = await api.get(`/traffic/${location}/today`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch count')
    }
  }

  async updateCount(location: string, count: TrafficCount): Promise<TrafficCount> {
    try {
      const response = await api.post(`/traffic/${location}/update`, count)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update count')
    }
  }

  async getCountHistory(location: string, days: number = 7): Promise<any[]> {
    try {
      const response = await api.get(`/traffic/${location}/history?days=${days}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch history')
    }
  }
}
