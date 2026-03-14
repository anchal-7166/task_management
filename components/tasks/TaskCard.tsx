'use client'

import { useState } from 'react'
import { Task } from '@/hooks/useTasks'
import { Pencil, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
}

const STATUS_OPTIONS: Task['status'][] = ['todo', 'in-progress', 'done']
const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await onDelete(task._id)
  }

  return (
    <div
      className={clsx(
        'glass rounded-xl overflow-hidden transition-all duration-200 animate-slide-up',
        deleting && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={clsx(
              'text-ink-100 font-medium text-sm leading-snug',
              task.status === 'done' && 'line-through text-ink-500'
            )}>
              {task.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-ink-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
              title="Edit task"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-ink-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`badge badge-${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`badge badge-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.dueDate && (
            <span className="badge bg-ink-800 text-ink-400 border-ink-700 gap-1">
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>

        {/* Description toggle */}
        {task.description && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-ink-500 hover:text-ink-300 text-xs transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide' : 'Show'} description
          </button>
        )}

        {expanded && task.description && (
          <p className="text-ink-400 text-xs leading-relaxed mt-2 pt-2 border-t border-ink-800/60">
            {task.description}
          </p>
        )}
      </div>

      {/* Status change footer */}
      <div className="border-t border-ink-800/60 bg-ink-900/40 px-4 py-2 flex items-center gap-1">
        <span className="text-ink-600 text-xs mr-1">Move to:</span>
        {STATUS_OPTIONS.filter((s) => s !== task.status).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(task._id, s)}
            className="text-ink-500 hover:text-ink-200 text-xs px-2 py-1 rounded hover:bg-ink-700 transition-all"
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}