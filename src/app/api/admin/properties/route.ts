import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'
import { cookies } from 'next/headers'

// GET - Tüm ilanları listele
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

    const properties = await prisma.property.findMany({
      orderBy: { order: 'asc' },
      include: {
        images: {
          select: { id: true, url: true, order: true }
        },
        tags: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Properties GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni ilan oluştur
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

    const { title, description, price, minOfferPrice, location, order, isFeatured, images, tags, video } = await request.json()

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { errors: { title: 'İlan başlığı gereklidir' } },
        { status: 400 }
      )
    }

    if (!location || location.trim().length === 0) {
      return NextResponse.json(
        { errors: { location: 'Konum bilgisi gereklidir' } },
        { status: 400 }
      )
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { errors: { price: 'Geçerli bir fiyat giriniz' } },
        { status: 400 }
      )
    }

    if (minOfferPrice !== undefined && minOfferPrice !== null && minOfferPrice < 0) {
      return NextResponse.json(
        { errors: { minOfferPrice: 'Minimum teklif fiyatı 0\'dan küçük olamaz' } },
        { status: 400 }
      )
    }

    if (!order || order <= 0) {
      return NextResponse.json(
        { errors: { order: 'Sıra 0\'dan büyük olmalıdır' } },
        { status: 400 }
      )
    }

    // Check if order already exists
    const existingProperty = await prisma.property.findFirst({
      where: { 
        order: parseInt(order)
      }
    })

    if (existingProperty) {
      return NextResponse.json(
        { errors: { order: 'Bu sıra numarası zaten kullanılmaktadır' } },
        { status: 400 }
      )
    }

    // Create property with image and tags
    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        minOfferPrice: minOfferPrice ? parseFloat(minOfferPrice) : null,
        location: location.trim(),
        video: video?.trim() || null,
        order: parseInt(order),
        isFeatured: Boolean(isFeatured),
        images: images && images.length > 0 ? {
          create: images.map((imageUrl: string, index: number) => ({
            url: imageUrl,
            order: index
          }))
        } : undefined,
        tags: tags && tags.length > 0 ? {
          create: tags.map((tag: string) => ({
            name: tag.trim()
          }))
        } : undefined
      },
      include: {
        images: {
          select: { id: true, url: true, order: true }
        },
        tags: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Properties POST error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
