import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Get all slider images
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

    const images = await prisma.sliderImage.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Slider images GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Create new slider image
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

    const { name, url, description, order, isActive } = await request.json()

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { errors: { name: 'Görsel adı gereklidir' } },
        { status: 400 }
      )
    }

    if (!url || url.trim().length === 0) {
      return NextResponse.json(
        { errors: { url: 'Görsel URL\'si gereklidir' } },
        { status: 400 }
      )
    }

    // Get next order if not provided
    let finalOrder = order
    if (!finalOrder) {
      const lastImage = await prisma.sliderImage.findFirst({
        orderBy: { order: 'desc' }
      })
      finalOrder = (lastImage?.order || 0) + 1
    }

    // Check if order already exists
    const existingImage = await prisma.sliderImage.findFirst({
      where: { order: parseInt(finalOrder.toString()) }
    })

    if (existingImage) {
      return NextResponse.json(
        { errors: { order: 'Bu sıra numarası zaten kullanılmaktadır' } },
        { status: 400 }
      )
    }

    // Create slider image
    const sliderImage = await prisma.sliderImage.create({
      data: {
        name: name.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        order: parseInt(finalOrder.toString()),
        isActive: Boolean(isActive ?? true),
      }
    })

    return NextResponse.json(sliderImage, { status: 201 })
  } catch (error) {
    console.error('Slider image POST error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
