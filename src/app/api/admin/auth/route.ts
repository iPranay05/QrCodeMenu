import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const correctPassword = process.env.ADMIN_SECRET_KEY
    
    if (!correctPassword) {
      return NextResponse.json({ success: false, error: 'Admin secret not configured on server' }, { status: 500 })
    }

    if (password === correctPassword) {
      // In a more robust system, we would set an HttpOnly cookie here.
      // For this simple admin panel, we just return success so the client state updates.
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}
