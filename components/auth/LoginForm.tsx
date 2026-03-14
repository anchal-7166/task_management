'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password, redirect)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Invalid email or password')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl text-amber-400 italic">
          TaskFlow
        </Link>
        <p className="text-ink-400 text-sm mt-2">Welcome back</p>
      </div>

      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl text-ink-100 mb-6">Sign in</h1>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 mb-5 text-rose-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              className="input-base"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-base pr-11"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="text-center text-ink-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-400 hover:text-amber-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}