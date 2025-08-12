import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  role: string
  expires: number
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return null
    
    return parseSessionToken(sessionCookie)
  } catch {
    return null
  }
}

export function createSessionToken(userId: string, role: string): string {
  const expires = Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
  const sessionData = { userId, role, expires }
  
  // Create a simple base64 encoded session token
  const sessionString = JSON.stringify(sessionData)
  return Buffer.from(sessionString).toString('base64')
}

export function parseSessionToken(token: string): SessionData | null {
  try {
    const sessionString = Buffer.from(token, 'base64').toString('utf8')
    const sessionData = JSON.parse(sessionString) as SessionData
    
    // Check if session is expired
    if (sessionData.expires < Date.now()) {
      return null
    }
    
    return sessionData
  } catch (error) {
    console.error('Session parsing failed:', error)
    return null
  }
}

export function createSessionCookie(userId: string, role: string) {
  const token = createSessionToken(userId, role)
  const expires = Date.now() + (24 * 60 * 60 * 1000)
  const isHttps = process.env.NEXTAUTH_URL?.startsWith('https')
  
  return {
    name: 'session',
    value: token,
    expires: new Date(expires),
    httpOnly: true,
    secure: isHttps, // Only secure if using HTTPS
    sameSite: 'lax' as const, // lax for better compatibility
    path: '/',
  }
}

export function getSessionFromRequest(request: NextRequest): SessionData | null {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return null
  
  return parseSessionToken(sessionCookie)
}

export function createLogoutResponse(request: NextRequest, redirectUrl: string) {
  const response = NextResponse.redirect(new URL(redirectUrl, request.url))
  const isHttps = process.env.NEXTAUTH_URL?.startsWith('https')
  
  response.cookies.set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isHttps, // Only secure if using HTTPS
    sameSite: 'lax' as const, // lax for better compatibility
    path: '/',
  })
  return response
}
