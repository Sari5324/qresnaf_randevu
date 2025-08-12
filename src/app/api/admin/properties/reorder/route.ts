import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// PUT - İlan sıralarını güncelle (drag & drop için)
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

    const { reorderedProperties } = await request.json()

    if (!Array.isArray(reorderedProperties)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }

    // Transaction içinde tüm ilan sıralarını güncelle
    await prisma.$transaction(async (tx) => {
      for (const property of reorderedProperties) {
        await tx.property.update({
          where: { id: property.id },
          data: { order: property.order }
        })
      }
    })

    return NextResponse.json({ message: 'İlan sıraları başarıyla güncellendi' })
  } catch (error) {
    console.error('Property reorder error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
