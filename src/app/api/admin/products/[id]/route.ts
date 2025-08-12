import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Tek ürün getir
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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Ürünü güncelle
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
    const { name, description, price, order, categoryId, image } = await request.json()

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { errors: { name: 'Ürün adı gereklidir' } },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { errors: { categoryId: 'Kategori seçimi gereklidir' } },
        { status: 400 }
      )
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { errors: { price: 'Geçerli bir fiyat giriniz' } },
        { status: 400 }
      )
    }

    if (!order || order < 1) {
      return NextResponse.json(
        { errors: { order: 'Geçerli bir sıra numarası giriniz' } },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { errors: { categoryId: 'Seçilen kategori bulunamadı' } },
        { status: 400 }
      )
    }

    // Check if order already exists in the same category (except current product)
    const orderConflict = await prisma.product.findFirst({
      where: { 
        order: parseInt(order),
        categoryId: categoryId,
        id: { not: id }
      }
    })

    if (orderConflict) {
      return NextResponse.json(
        { errors: { order: 'Bu kategoride aynı sıra numarası zaten kullanılıyor' } },
        { status: 400 }
      )
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        order: parseInt(order),
        categoryId,
        image: image?.trim() || null,
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Ürünü sil
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    const { order: deletedOrder, categoryId } = existingProduct

    // Delete product and update orders in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the product
      await tx.product.delete({
        where: { id }
      })

      // Update orders of products in the same category with higher order numbers
      await tx.product.updateMany({
        where: {
          categoryId,
          order: {
            gt: deletedOrder
          }
        },
        data: {
          order: {
            decrement: 1
          }
        }
      })
    })

    return NextResponse.json({ message: 'Ürün başarıyla silindi' })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
