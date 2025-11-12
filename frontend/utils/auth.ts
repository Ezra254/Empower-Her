// Auth utility functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  subscription?: {
    plan: string
    status: string
  }
}

export const authService = {
  // Save token to localStorage
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },

  // Get token from localStorage
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  // Remove token
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },

  // Register new user
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firstName, lastName, email, password })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    if (data.token) {
      authService.setToken(data.token)
    }

    return data
  },

  // Login user (supports email or admin ID)
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    if (data.token) {
      authService.setToken(data.token)
    }

    return data
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const token = authService.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        authService.removeToken()
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      authService.removeToken()
      return null
    }
  },

  // Logout
  logout: () => {
    authService.removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  },

  // Get auth headers
  getAuthHeaders: () => {
    const token = authService.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
}


