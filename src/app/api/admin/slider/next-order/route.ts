import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find the highest order value
    const highestOrder = await prisma.sliderImage.findFirst({
      orderBy: {
        order: 'desc'
      },
      select: {
        order: true
      }
    })

    const nextOrder = (highestOrder?.order || 0) + 1

    return NextResponse.json({ 
      nextOrder,
      success: true 
    })
  } catch (error) {
    console.error('Next order fetch error:', error)
    return NextResponse.json(
      { error: 'Sıra numarası alınırken hata oluştu', success: false },
      { status: 500 }
    )
  }
}
