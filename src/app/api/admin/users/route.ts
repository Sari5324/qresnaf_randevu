import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'
import { hashPassword } from '@/lib/auth'

// GET - Tüm kullanıcıları getir
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Sadece current user email'ini döndür
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true }
    })

    return NextResponse.json({ 
      users, 
      currentUserEmail: currentUser?.email 
    })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { username, email, password, role } = await request.json()

    // Validation
    const errors: { [key: string]: string } = {}

    if (!username || username.trim().length === 0) {
      errors.username = 'Kullanıcı adı gereklidir'
    }

    if (!email || email.trim().length === 0) {
      errors.email = 'E-posta gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Geçerli bir e-posta adresi girin'
    }

    if (!password || password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır'
    }

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      errors.role = 'Geçerli bir rol seçin'
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() }
    })

    if (existingUser) {
      errors.email = 'Bu e-posta adresi zaten kullanımda'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Users POST error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
