import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Tüm ürünleri listele
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

    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni ürün oluştur
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

    if (!order || order <= 0) {
      return NextResponse.json(
        { errors: { order: 'Sıra 0\'dan büyük olmalıdır' } },
        { status: 400 }
      )
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

    // Check if order already exists in the same category
    const existingProduct = await prisma.product.findFirst({
      where: { 
        order: parseInt(order),
        categoryId: categoryId
      }
    })

    if (existingProduct) {
      return NextResponse.json(
        { errors: { order: 'Bu kategoride aynı sıra numarası zaten kullanılmaktadır' } },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
