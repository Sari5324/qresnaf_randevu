import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Get single slider image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params

    const sliderImage = await prisma.sliderImage.findUnique({
      where: { id }
    })

    if (!sliderImage) {
      return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(sliderImage)
  } catch (error) {
    console.error('Slider image GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Update slider image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params
    const { name, url, description, order, isActive } = await request.json()

    // Check if image exists
    const existingImage = await prisma.sliderImage.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { errors: { name: 'Görsel adı gereklidir' } },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (url !== undefined) {
      if (!url || url.trim().length === 0) {
        return NextResponse.json(
          { errors: { url: 'Görsel URL\'si gereklidir' } },
          { status: 400 }
        )
      }
      updateData.url = url.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
    }

    if (order !== undefined) {
      const newOrder = parseInt(order.toString())
      if (newOrder !== existingImage.order) {
        // Check if new order already exists
        const orderExists = await prisma.sliderImage.findFirst({
          where: { 
            order: newOrder,
            id: { not: id }
          }
        })

        if (orderExists) {
          return NextResponse.json(
            { errors: { order: 'Bu sıra numarası zaten kullanılmaktadır' } },
            { status: 400 }
          )
        }
        updateData.order = newOrder
      }
    }

    // Update slider image
    const updatedImage = await prisma.sliderImage.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Slider image PUT error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Delete slider image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { id } = await params

    // Check if image exists
    const existingImage = await prisma.sliderImage.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 })
    }

    // Delete slider image
    await prisma.sliderImage.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Görsel silindi' })
  } catch (error) {
    console.error('Slider image DELETE error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
