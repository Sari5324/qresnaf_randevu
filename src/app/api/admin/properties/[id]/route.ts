import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Tek ilan getir
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

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          select: { id: true, url: true, order: true }
        },
        tags: {
          select: { id: true, name: true }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Property GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - İlanı güncelle
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
    const { title, description, price, minOfferPrice, location, order, isFeatured, images, tags, video, imagesToRemove } = await request.json()

    console.log('PUT request data:', { title, description, price, minOfferPrice, location, order, isFeatured, images, tags, video, imagesToRemove })

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

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 })
    }

    // Check if order already exists (excluding current property)
    const existingPropertyWithOrder = await prisma.property.findFirst({
      where: { 
        order: parseInt(order),
        id: { not: id }
      }
    })

    if (existingPropertyWithOrder) {
      return NextResponse.json(
        { errors: { order: 'Bu sıra numarası zaten kullanılmaktadır' } },
        { status: 400 }
      )
    }

    // Update property with transaction for images and tags
    const property = await prisma.$transaction(async (tx) => {
      // Remove specific images if requested
      if (imagesToRemove && imagesToRemove.length > 0) {
        await tx.propertyImage.deleteMany({
          where: { 
            propertyId: id,
            id: { in: imagesToRemove }
          }
        })
      }
      
      // Delete existing tags (we'll recreate them)
      await tx.propertyTag.deleteMany({
        where: { propertyId: id }
      })

      // Update property
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          price: parseFloat(price),
          minOfferPrice: minOfferPrice ? parseFloat(minOfferPrice) : null,
          location: location.trim(),
          video: video?.trim() || null,
          order: parseInt(order),
          isFeatured: Boolean(isFeatured),
          tags: tags && tags.length > 0 ? {
            create: tags.map((tag: any) => ({
              name: typeof tag === 'string' ? tag.trim() : tag.name.trim(),
              icon: typeof tag === 'object' && tag.icon ? tag.icon : null
            }))
          } : undefined
        }
      })

      // Add new images if provided
      if (images && images.length > 0) {
        // Get current max order
        const maxOrder = await tx.propertyImage.findFirst({
          where: { propertyId: id },
          orderBy: { order: 'desc' },
          select: { order: true }
        })
        
        const startOrder = maxOrder ? maxOrder.order + 1 : 0
        
        await tx.propertyImage.createMany({
          data: images.map((imageUrl: string, index: number) => ({
            propertyId: id,
            url: imageUrl,
            order: startOrder + index
          }))
        })
      }

      // Return updated property with relations
      return await tx.property.findUnique({
        where: { id },
        include: {
          images: {
            select: { id: true, url: true, order: true },
            orderBy: { order: 'asc' }
          },
          tags: {
            select: { id: true, name: true }
          }
        }
      })
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Property PUT error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - İlanı sil
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

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 })
    }

    // Delete property (cascade will handle images, tags, and views)
    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'İlan başarıyla silindi' })
  } catch (error) {
    console.error('Property DELETE error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
