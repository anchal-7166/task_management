import { NextRequest } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'
import { successResponse } from '@/lib/response'

export async function POST(_req: NextRequest) {
  await clearAuthCookie()
  return successResponse(null, 'Logged out successfully')
}