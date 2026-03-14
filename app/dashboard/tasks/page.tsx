'use client'

import { useEffect, useState } from 'react'
import { useTasks, Task } from '@/hooks/useTasks'
import TaskCard from '@/components/tasks/TaskCard'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import TaskModal from '@/components/tasks/TaskModel'

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TasksPage() {
  const { tasks, loading, pagination, filters, fetchTasks, updateFilters, createTask, updateTask, deleteTask } = useTasks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, []) // eslint-disable-line

  const openCreate = () => { setEditingTask(null); setModalOpen(true) }
  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true) }

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask._id, data)
    } else {
      await createTask(data as Parameters<typeof createTask>[0])
    }
  }

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status })
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink-50 font-light">Tasks</h1>
          <p className="text-ink-500 text-sm mt-0.5">
            {pagination ? `${pagination.total} task${pagination.total !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-ink-900 border border-ink-800 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateFilters({ status: tab.value as typeof filters.status })}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm transition-all',
              filters.status === tab.value
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : 'text-ink-500 hover:text-ink-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            className="input-base pl-9 py-2"
            placeholder="Search tasks by title..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'btn-secondary flex items-center gap-2',
            showFilters && 'border-amber-500/30 text-amber-400'
          )}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-4 animate-slide-down">
          <div className="flex items-center gap-2">
            <label className="text-ink-400 text-sm">Priority:</label>
            <select
              className="input-base w-auto py-1.5 text-xs"
              value={filters.priority}
              onChange={(e) => updateFilters({ priority: e.target.value as typeof filters.priority })}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-ink-400 text-sm">Sort by:</label>
            <select
              className="input-base w-auto py-1.5 text-xs"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as typeof filters.sortBy })}
            >
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="title">Title</option>
              <option value="dueDate">Due Date</option>
            </select>
            <select
              className="input-base w-auto py-1.5 text-xs"
              value={filters.sortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value as typeof filters.sortOrder })}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-ink-400 text-sm">Per page:</label>
            <select
              className="input-base w-auto py-1.5 text-xs"
              value={filters.limit}
              onChange={(e) => updateFilters({ limit: Number(e.target.value) })}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Task grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 shimmer rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-ink-500 mb-3">
            {filters.search || filters.status !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet'}
          </p>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2 mx-auto">
            <Plus size={14} />
            Create task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEdit}
              onDelete={deleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => updateFilters({ page: filters.page - 1 })}
            disabled={!pagination.hasPrevPage}
            className="btn-secondary flex items-center gap-1.5 py-2 disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="text-ink-400 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: filters.page + 1 })}
            disabled={!pagination.hasNextPage}
            className="btn-secondary flex items-center gap-1.5 py-2 disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}