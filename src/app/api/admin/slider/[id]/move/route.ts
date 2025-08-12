import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// PUT - Move slider image up or down
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
    const { direction } = await request.json()

    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Geçersiz yön' }, { status: 400 })
    }

    // Get current image
    const currentImage = await prisma.sliderImage.findUnique({
      where: { id }
    })

    if (!currentImage) {
      return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 })
    }

    // Get target image to swap with
    const targetOrder = direction === 'up' 
      ? currentImage.order - 1 
      : currentImage.order + 1

    const targetImage = await prisma.sliderImage.findFirst({
      where: { order: targetOrder }
    })

    if (!targetImage) {
      return NextResponse.json({ error: 'Taşıma işlemi yapılamaz' }, { status: 400 })
    }

    // Perform the swap using a transaction
    await prisma.$transaction([
      // Set current image to temporary order
      prisma.sliderImage.update({
        where: { id: currentImage.id },
        data: { order: -1 }
      }),
      // Set target image to current order
      prisma.sliderImage.update({
        where: { id: targetImage.id },
        data: { order: currentImage.order }
      }),
      // Set current image to target order
      prisma.sliderImage.update({
        where: { id: currentImage.id },
        data: { order: targetImage.order }
      })
    ])

    return NextResponse.json({ message: 'Sıralama güncellendi' })
  } catch (error) {
    console.error('Slider move error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
