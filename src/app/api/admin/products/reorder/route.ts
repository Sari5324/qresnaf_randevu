import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// PUT - Ürün sıralarını güncelle (drag & drop için)
export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { reorderedProducts } = await request.json()

    if (!Array.isArray(reorderedProducts)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }

    // Transaction içinde tüm ürün sıralarını güncelle
    await prisma.$transaction(async (tx) => {
      for (const product of reorderedProducts) {
        await tx.product.update({
          where: { id: product.id },
          data: { order: product.order }
        })
      }
    })

    return NextResponse.json({ message: 'Ürün sıraları başarıyla güncellendi' })
  } catch (error) {
    console.error('Product reorder error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
