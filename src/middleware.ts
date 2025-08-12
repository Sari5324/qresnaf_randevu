import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Pathname'i header'a ekle
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Protect admin routes for appointment system
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return response
    }

    const session = getSessionFromRequest(request)
    
    if (!session || session.role !== 'ADMIN') {
      // Environment variable'dan base URL'i al
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
      return NextResponse.redirect(new URL('/admin/login', baseUrl))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)','/admin/:path*']
}
