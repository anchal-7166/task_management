'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTasks } from '@/hooks/useTasks'
import { CheckCircle2, Circle, Clock, ListTodo, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Task } from '@/hooks/useTasks'

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, fetchTasks, loading } = useTasks()
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 })

  useEffect(() => {
    fetchTasks({ limit: 50 })
  }, []) // eslint-disable-line

  useEffect(() => {
    const todo = tasks.filter((t) => t.status === 'todo').length
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length
    const done = tasks.filter((t) => t.status === 'done').length
    setStats({ todo, inProgress, done, total: tasks.length })
  }, [tasks])

  const recent = tasks.slice(0, 5)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50 font-light">
          Good {getGreeting()},{' '}
          <em className="text-amber-400 not-italic">{user?.name?.split(' ')[0]}</em>
        </h1>
        <p className="text-ink-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-ink-300', bg: 'bg-ink-800' },
          { label: 'To Do', value: stats.todo, icon: Circle, color: 'text-ink-400', bg: 'bg-ink-800' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-jade-400', bg: 'bg-jade-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-xl p-5 animate-scale-in">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className={`text-3xl font-display font-light ${color} mb-1`}>
              {loading ? '—' : value}
            </div>
            <div className="text-ink-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="glass rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ink-300 text-sm font-medium">Overall Progress</span>
            <span className="text-ink-400 text-sm">
              {stats.done}/{stats.total} done
            </span>
          </div>
          <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-ink-500 text-xs mt-2">
            {Math.round(stats.total > 0 ? (stats.done / stats.total) * 100 : 0)}% complete
          </p>
        </div>
      )}

      {/* Recent tasks */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800">
          <h2 className="font-display text-lg text-ink-100">Recent Tasks</h2>
          <Link href="/dashboard/tasks" className="text-amber-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 shimmer rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-ink-500 text-sm mb-3">No tasks yet</p>
            <Link href="/dashboard/new" className="btn-primary text-sm">
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-800/60">
            {recent.map((task: Task) => (
              <div key={task._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-800/30 transition-colors">
                <StatusDot status={task.status} />
                <span className="flex-1 text-ink-200 text-sm truncate">{task.title}</span>
                <span className={`badge ${task.status === 'done' ? 'badge-done' : task.status === 'in-progress' ? 'badge-in-progress' : 'badge-todo'}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: 'bg-ink-600',
    'in-progress': 'bg-amber-500',
    done: 'bg-jade-500',
  }
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status] || 'bg-ink-600'}`} />
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}