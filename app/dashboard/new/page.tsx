'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, useTasks } from '@/hooks/useTasks'
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

const STATUSES = ['todo', 'in-progress', 'done'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const

export default function NewTaskPage() {
  const router = useRouter()
  const { createTask } = useTasks()
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await createTask({
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/tasks'), 1200)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data?.errors) {
          const flat: Record<string, string> = {}
          for (const [key, msgs] of Object.entries(data.errors)) {
            flat[key] = (msgs as string[])[0]
          }
          setErrors(flat)
        } else {
          setErrors({ general: data?.error || 'Failed to create task' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 bg-jade-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-jade-400" />
          </div>
          <h2 className="font-display text-2xl text-ink-100 mb-1">Task created!</h2>
          <p className="text-ink-400 text-sm">Redirecting to your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/tasks" className="btn-ghost inline-flex items-center gap-2 mb-4 -ml-2">
          <ArrowLeft size={15} /> Back to tasks
        </Link>
        <h1 className="font-display text-3xl text-ink-50 font-light">New Task</h1>
        <p className="text-ink-500 text-sm mt-1">Descriptions are encrypted with AES-256 before storage</p>
      </div>

      <div className="glass rounded-2xl p-6">
        {errors.general && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 mb-5 text-rose-400 text-sm">
            <AlertCircle size={15} />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className={`input-base ${errors.title ? 'border-rose-500/60' : ''}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={100}
              autoFocus
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
            <p className="text-ink-600 text-xs mt-1">{form.title.length}/100</p>
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Description
              <span className="text-ink-600 text-xs ml-1 font-normal">(stored encrypted)</span>
            </label>
            <textarea
              className="input-base resize-none h-28"
              placeholder="Add details, notes, or context..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000}
            />
            <p className="text-ink-600 text-xs mt-1">{form.description.length}/1000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-300 text-sm mb-1.5 font-medium">Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-ink-300 text-sm mb-1.5 font-medium">Priority</label>
              <select
                className="input-base"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">Due Date</label>
            <input
              type="date"
              className="input-base"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-800">
            <Link href="/dashboard/tasks" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={15} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}