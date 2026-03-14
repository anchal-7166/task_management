import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import { encryptTaskDescription, decryptTaskDescription } from '@/lib/encryption'
import { createTaskSchema, taskQuerySchema, TaskQueryInput } from '@/lib/validation'
import {
  successResponse,
  paginatedResponse,
  validationErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'
import Task from '@/models/Task'
import { getUserFromRequest } from '@/lib/auth'
import mongoose from 'mongoose'

// GET /api/tasks - List tasks with pagination, filtering, search
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return unauthorizedResponse()

    await connectDB()

    // Parse and validate query params
    const { searchParams } = new URL(req.url)
    const rawQuery = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || 'all',
      priority: searchParams.get('priority') || 'all',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    let query: TaskQueryInput
    try {
      query = taskQuerySchema.parse(rawQuery)
    } catch (error) {
      if (error instanceof ZodError) return validationErrorResponse(error)
      throw error
    }

    const { page, limit, status, priority, search, sortBy, sortOrder } = query

    // Build MongoDB filter
    const filter: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(user.userId),
    }

    if (status !== 'all') filter.status = status
    if (priority !== 'all') filter.priority = priority

    // Search by title (case-insensitive regex)
    if (search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' }
    }

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Execute query and count in parallel
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ])

    // Decrypt task descriptions
    const decryptedTasks = tasks.map((task) => ({
      ...task,
      description: task.description
        ? decryptTaskDescription(task.description)
        : '',
    }))

    const totalPages = Math.ceil(total / limit)

    return paginatedResponse(
      decryptedTasks,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      'Tasks fetched successfully'
    )
  } catch (error) {
    console.error('[TASKS_GET_ERROR]', error)
    return serverErrorResponse()
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return unauthorizedResponse()

    await connectDB()

    const body = await req.json()

    let validatedData
    try {
      validatedData = createTaskSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) return validationErrorResponse(error)
      throw error
    }

    const { title, description, status, priority, dueDate } = validatedData

    // Encrypt the description before storing
    const encryptedDescription = description
      ? encryptTaskDescription(description)
      : ''

    const task = await Task.create({
      title,
      description: encryptedDescription,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: new mongoose.Types.ObjectId(user.userId),
    })

    // Return with decrypted description
    const taskObj = task.toJSON()
    return successResponse(
      { ...taskObj, description: description || '' },
      'Task created successfully',
      201
    )
  } catch (error) {
    console.error('[TASKS_POST_ERROR]', error)
    return serverErrorResponse()
  }
}