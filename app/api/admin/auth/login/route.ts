import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
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

    const email = username.trim().toLowerCase()
    let isAuthorizedAdmin = false

    // 1. Authenticate with Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })

      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email,
        password: password.trim()
      })

      if (!authError && authData?.user) {
        // Query user role in public.profiles table
        const adminDb = createAdminClient()
        const { data: profile, error: profileError } = await adminDb
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (profile?.role === 'admin') {
          isAuthorizedAdmin = true
        } else {
          return NextResponse.json(
            { error: 'Access denied. You do not have administrator privileges.' },
            { status: 403 }
          )
        }
      }
    }

    // 2. Fallback: check environment variable credentials
    if (!isAuthorizedAdmin && verifyAdminCredentials(username, password)) {
      isAuthorizedAdmin = true
    }

    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Invalid admin username or password' },
        { status: 401 }
      )
    }

    // Generate signed JWT token
    const token = await signAdminToken(email)
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

