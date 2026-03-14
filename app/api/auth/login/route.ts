import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
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

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { email, password } = result.data

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

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
      'Login successful'
    )
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    console.error('[LOGIN_ERROR]', error)
    return serverErrorResponse('Failed to login')
  }
}