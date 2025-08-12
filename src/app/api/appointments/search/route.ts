import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Randevu kodu gereklidir' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { code },
      include: {
        staff: {
          select: {
            name: true,
            title: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Appointment search error:', error)
    return NextResponse.json(
      { error: 'Randevu aranırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
