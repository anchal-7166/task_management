'use client'

import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  _id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TaskFilters {
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  search: string
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'dueDate'
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTasks = useCallback(async (overrideFilters?: Partial<TaskFilters>) => {
    setLoading(true)
    try {
      const active = { ...filters, ...overrideFilters }
      const params = new URLSearchParams({
        page: String(active.page),
        limit: String(active.limit),
        status: active.status,
        priority: active.priority,
        search: active.search,
        sortBy: active.sortBy,
        sortOrder: active.sortOrder,
      })
      const res = await axios.get(`/api/tasks?${params}`)
      setTasks(res.data.data)
      setPagination(res.data.pagination)
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to load tasks'
        : 'Failed to load tasks'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateFilters = useCallback((updates: Partial<TaskFilters>) => {
    const newFilters = { ...filters, ...updates, page: updates.page ?? 1 }
    setFilters(newFilters)

    if ('search' in updates) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchTasks(newFilters), 400)
    } else {
      fetchTasks(newFilters)
    }
  }, [filters, fetchTasks])

  const createTask = async (data: {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string | null
  }) => {
    const res = await axios.post('/api/tasks', data)
    toast.success('Task created!')
    await fetchTasks()
    return res.data.data as Task
  }

  const updateTask = async (id: string, data: Partial<Task>) => {
    const res = await axios.put(`/api/tasks/${id}`, data)
    toast.success('Task updated!')
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.data : t)))
    return res.data.data as Task
  }

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/tasks/${id}`)
    toast.success('Task deleted')
    setTasks((prev) => prev.filter((t) => t._id !== id))
    if (pagination) {
      setPagination((p) => p ? { ...p, total: p.total - 1 } : p)
    }
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    fetchTasks(DEFAULT_FILTERS)
  }

  return {
    tasks,
    loading,
    pagination,
    filters,
    fetchTasks,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    resetFilters,
  }
}