import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { message: 'Çıkış başarılı' },
    { status: 200 }
  )

  const isHttps = process.env.NEXTAUTH_URL?.startsWith('https')

  // Clear the session cookie
  response.cookies.set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isHttps, // Only secure if using HTTPS
    sameSite: 'lax' as const, // lax for better compatibility
    path: '/',
  })

  return response
}
