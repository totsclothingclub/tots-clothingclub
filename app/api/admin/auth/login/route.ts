import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdminCredentials,
  signAdminToken,
  getAuthCookieOptions,
  ADMIN_COOKIE_NAME
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const isValid = verifyAdminCredentials(username, password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin username or password' },
        { status: 401 }
      )
    }

    // Generate signed JWT token
    const token = await signAdminToken(username.trim())
    const cookieOptions = getAuthCookieOptions()

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful'
    })

    // Set HttpOnly secure session cookie
    response.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions)

    return response
  } catch (err: any) {
    console.error('Admin login error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred during authentication' },
      { status: 500 }
    )
  }
}
