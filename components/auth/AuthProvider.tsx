'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, redirect?: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me')
      setUser(res.data.data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      try {
        const res = await axios.get('/api/auth/me')
        if (!cancelled) setUser(res.data.data.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()
    return () => { cancelled = true }
  }, [])

  const login = async (email: string, password: string, redirect?: string) => {
  const res = await axios.post('/api/auth/login', { email, password })
  setUser(res.data.data.user)

  window.location.href = redirect || '/dashboard'
}

  const register = async (name: string, email: string, password: string) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    setUser(res.data.data.user)
    // ✅ Same fix for register
    window.location.href = '/dashboard'
  }

  const logout = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
    // ✅ Hard navigation on logout too — clears all client state cleanly
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}