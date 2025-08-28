import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Pathname'i header'a ekle
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Protect admin routes for appointment system
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page and API routes
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname.startsWith('/api/')) {
      return response
    }

    try {
      const session = getSessionFromRequest(request)
      
      if (!session || session.role !== 'ADMIN') {
        console.log('No valid session, redirecting to login')
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('Middleware session error:', error)
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)','/admin/:path*']
}
