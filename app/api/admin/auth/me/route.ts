import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const { valid, payload } = await verifyAdminToken(token)

    if (!valid || !payload) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: payload.sub,
        role: payload.role
      }
    })
  } catch (err: any) {
    console.error('Session check error:', err)
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
