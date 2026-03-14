import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import { encryptTaskDescription, decryptTaskDescription } from '@/lib/encryption'
import { updateTaskSchema } from '@/lib/validation'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import Task from '@/models/Task'
import { getUserFromRequest } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// GET /api/tasks/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return unauthorizedResponse()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse('Task not found')
    }

    await connectDB()

    const task = await Task.findById(params.id).lean()
    if (!task) return notFoundResponse('Task not found')

    // Authorization: users can only access their own tasks
    if (task.userId.toString() !== user.userId) {
      return forbiddenResponse('You do not have access to this task')
    }

    return successResponse({
      ...task,
      description: task.description ? decryptTaskDescription(task.description) : '',
    })
  } catch (error) {
    console.error('[TASK_GET_ERROR]', error)
    return serverErrorResponse()
  }
}

// PUT /api/tasks/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return unauthorizedResponse()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse('Task not found')
    }

    await connectDB()

    const task = await Task.findById(params.id)
    if (!task) return notFoundResponse('Task not found')

    if (task.userId.toString() !== user.userId) {
      return forbiddenResponse('You do not have access to this task')
    }

    const body = await req.json()

    let validatedData
    try {
      validatedData = updateTaskSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) return validationErrorResponse(error)
      throw error
    }

    const { title, description, status, priority, dueDate } = validatedData

    // Update fields only if provided
    if (title !== undefined) task.title = title
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null

    // Encrypt description if updated
    if (description !== undefined) {
      task.description = description ? encryptTaskDescription(description) : ''
    }

    await task.save()

    const taskObj = task.toJSON()
    return successResponse(
      {
        ...taskObj,
        description: description !== undefined
          ? description
          : (task.description ? decryptTaskDescription(task.description) : ''),
      },
      'Task updated successfully'
    )
  } catch (error) {
    console.error('[TASK_PUT_ERROR]', error)
    return serverErrorResponse()
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return unauthorizedResponse()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse('Task not found')
    }

    await connectDB()

    const task = await Task.findById(params.id)
    if (!task) return notFoundResponse('Task not found')

    if (task.userId.toString() !== user.userId) {
      return forbiddenResponse('You do not have access to this task')
    }

    await task.deleteOne()

    return successResponse(null, 'Task deleted successfully')
  } catch (error) {
    console.error('[TASK_DELETE_ERROR]', error)
    return serverErrorResponse()
  }
}