import { NextResponse } from 'next/server'
import { createAdminSessionToken, isAuthorizedAdmin } from '@/lib/adminAuth'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// Check existing session
export async function GET(req: Request) {
  if (isAuthorizedAdmin(req)) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}

// Log in
export async function POST(req: Request) {
  try {
    // Brute-force protection: max 10 login attempts per IP per 15 minutes
    const clientIp = getClientIp(req)
    const { success } = checkRateLimit(`admin-login:${clientIp}`, 10, 15 * 60 * 1000)
    if (!success) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
    }

    const { password } = await req.json()
    const correctPassword = process.env.ADMIN_SECRET_KEY
    
    if (!correctPassword) {
      return NextResponse.json({ success: false, error: 'Admin secret not configured on server' }, { status: 500 })
    }

    if (password === correctPassword) {
      const token = createAdminSessionToken(correctPassword)
      const res = NextResponse.json({ success: true })
      
      // HttpOnly cookie: cannot be accessed via JavaScript or browser Inspect / DevTools
      res.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return res
    }
    
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}

// Log out
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

