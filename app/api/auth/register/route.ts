import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/response'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Zod v4: use safeParse to avoid try/catch complexity
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { name, email, password } = result.data

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return errorResponse('An account with this email already exists', 409)
    }

    const user = await User.create({ name, email, password })

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    })

    await setAuthCookie(token)

    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      'Account created successfully',
      201
    )
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    console.error('[REGISTER_ERROR]', error)
    return serverErrorResponse('Failed to create account')
  }
}