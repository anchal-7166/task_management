'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/hooks/useTasks'
import { X, Save } from 'lucide-react'
import axios from 'axios'

interface TaskModalProps {
  task?: Task | null
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Task>) => Promise<void>
}

const STATUSES = ['todo', 'in-progress', 'done'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const

export default function TaskModal({ task, open, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      })
    } else {
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' })
    }
    setErrors({})
  }, [task, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      })
      onClose()
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
          setErrors({ general: data?.error || 'Failed to save task' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-800">
          <h2 className="font-display text-xl text-ink-100">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {errors.general}
            </p>
          )}

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className={`input-base ${errors.title ? 'border-rose-500/60' : ''}`}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={100}
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-ink-300 text-sm mb-1.5 font-medium">
              Description{' '}
              <span className="text-ink-600 text-xs font-normal">(encrypted at rest)</span>
            </label>
            <textarea
              className="input-base resize-none h-24"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000}
            />
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
                  <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
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
                  {task ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}