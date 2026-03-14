import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getUserFromRequest } from '@/lib/auth'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req)
    if (!payload) {
      return unauthorizedResponse('Please login to continue')
    }

    await connectDB()

    const user = await User.findById(payload.userId)
    if (!user) {
      return notFoundResponse('User not found')
    }

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('[ME_ERROR]', error)
    return serverErrorResponse()
  }
}