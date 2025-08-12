import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' }, 
        { status: 401 }
      )
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkiniz bulunmuyor' }, 
        { status: 403 }
      )
    }

    const { id } = await context.params

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  in: ['PENDING', 'CONFIRMED']
                }
              }
            }
          }
        }
      }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Personel bulunamadı' },
        { status: 404 }
      )
    }

    // Check if staff has active appointments
    if (staff._count.appointments > 0) {
      return NextResponse.json(
        { 
          error: 'Bu personelin aktif randevuları bulunuyor. Önce randevuları iptal edin.',
          hasActiveAppointments: true
        },
        { status: 400 }
      )
    }

    // Delete staff (this will cascade delete work schedules)
    await prisma.staff.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Personel başarıyla silindi'
    })

  } catch (error) {
    console.error('Staff deletion error:', error)
    return NextResponse.json(
      { error: 'Personel silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
