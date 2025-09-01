import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: { 
        id: session.userId, 
        role: session.role 
      } 
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
