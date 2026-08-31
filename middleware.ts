import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Skip non-admin routes completely
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // 2. Allow public auth API routes (login and logout)
  if (
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'
  ) {
    return NextResponse.next()
  }

  // Extract session token from cookie
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  const { valid } = await verifyAdminToken(token)

  // 3. Handle Admin Login Page (/admin/login)
  if (pathname === '/admin/login') {
    if (valid) {
      // Already logged in, redirect to admin dashboard
      const dashboardUrl = new URL('/admin/dashboard', req.url)
      return NextResponse.redirect(dashboardUrl)
    }
    // Not logged in, permit viewing the login page
    return NextResponse.next()
  }

  // 4. Handle Protected API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // 5. Handle Protected Admin Pages (/admin, /admin/dashboard, /admin/products, etc.)
  if (pathname.startsWith('/admin')) {
    if (!valid) {
      const loginUrl = new URL('/admin/login', req.url)
      if (pathname !== '/admin' && pathname !== '/admin/dashboard') {
        loginUrl.searchParams.set('redirect', pathname)
      }
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
