'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showRules, setShowRules] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data?.errors) {
          const flat: Record<string, string> = {}
          for (const [key, msgs] of Object.entries(data.errors)) {
            flat[key] = (msgs as string[])[0]
          }
          setFieldErrors(flat)
        } else {
          setError(data?.error || 'Registration failed')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display text-3xl text-amber-400 italic">
          TaskFlow
        </Link>
        <p className="text-ink-400 text-sm mt-2">Create your account</p>
      </div>

      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl text-ink-100 mb-6">Get started</h1>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 mb-5 text-rose-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Full name
            </label>
            <input
              type="text"
              className={`input-base ${fieldErrors.name ? 'border-rose-500/60' : ''}`}
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            {fieldErrors.name && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              className={`input-base ${fieldErrors.email ? 'border-rose-500/60' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input-base pr-11 ${fieldErrors.password ? 'border-rose-500/60' : ''}`}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setShowRules(true)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-rose-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
            {/* Password strength rules */}
            {showRules && form.password && (
              <div className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const passed = rule.test(form.password)
                  return (
                    <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-jade-400' : 'text-ink-500'}`}>
                      <CheckCircle2 size={12} className={passed ? 'text-jade-400' : 'text-ink-700'} />
                      {rule.label}
                    </div>
                  )
                })}
              </div>
            )}
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
                <UserPlus size={16} />
                Create account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-ink-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}