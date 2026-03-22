import { api } from '../api/cloudflareApi'

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async quickLogin(staffName: string, session: string): Promise<void> {
    try {
      // Simple session-based auth (no backend call needed for dev)
      const token = btoa(JSON.stringify({ staff: staffName, session, timestamp: Date.now() }))
      localStorage.setItem('authToken', token)
      localStorage.setItem('staffName', staffName)
      localStorage.setItem('session', session)
      localStorage.setItem('user', JSON.stringify({
        id: staffName.replace(/\s+/g, '-').toLowerCase(),
        name: staffName,
        role: 'monitor'
      }))
    } catch (error: any) {
      throw new Error('Session setup failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('staffName')
      localStorage.removeItem('session')
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  getStaffName(): string | null {
    return localStorage.getItem('staffName')
  }

  getSession(): string | null {
    return localStorage.getItem('session')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
