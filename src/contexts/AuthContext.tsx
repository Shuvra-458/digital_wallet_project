import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface User {
  username: string
  balance: number
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedAuth = localStorage.getItem('wallet_auth')
    if (savedAuth) {
      const { username, password } = JSON.parse(savedAuth)
      api.setAuth(username, password)
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.getBalance()
      const balance = parseFloat(response.balance.replace('₹', ''))
      setUser({ username: api.getUsername(), balance })
    } catch (error) {
      localStorage.removeItem('wallet_auth')
      api.clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      api.setAuth(username, password)
      const response = await api.getBalance()
      const balance = parseFloat(response.balance.replace('₹', ''))
      
      setUser({ username, balance })
      localStorage.setItem('wallet_auth', JSON.stringify({ username, password }))
      toast.success('Welcome back!')
      return true
    } catch (error: any) {
      api.clearAuth()
      toast.error(error.response?.data?.detail || 'Login failed')
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await api.register(username, password)
      toast.success('Account created successfully!')
      return await login(username, password)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('wallet_auth')
    api.clearAuth()
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    if (user) {
      try {
        const response = await api.getBalance()
        const balance = parseFloat(response.balance.replace('₹', ''))
        setUser(prev => prev ? { ...prev, balance } : null)
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}