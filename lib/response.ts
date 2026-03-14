import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  )
}

export function paginatedResponse<T>(
  data: T,
  pagination: ApiResponse['pagination'],
  message?: string
) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data, pagination },
    { status: 200 }
  )
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  const body: ApiResponse = { success: false, error: message }
  if (details) body.errors = details as Record<string, string[]>
  return NextResponse.json<ApiResponse>(body, { status })
}

export function validationErrorResponse(error: ZodError) {
  const errors: Record<string, string[]> = {}

  const issues = error.issues ?? (error as unknown as { errors: typeof error.issues }).errors ?? []

  issues.forEach((e) => {
    const key = e.path.join('.') || 'general'
    if (!errors[key]) errors[key] = []
    errors[key].push(e.message)
  })

  return NextResponse.json<ApiResponse>(
    { success: false, error: 'Validation failed', errors },
    { status: 422 }
  )
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 401 }
  )
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 403 }
  )
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 404 }
  )
}

export function serverErrorResponse(message = 'Internal server error') {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status: 500 }
  )
}