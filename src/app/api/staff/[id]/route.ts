import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

// GET - Get single staff member
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

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        workSchedule: true,
        _count: {
          select: {
            appointments: true
          }
        }
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Update staff member
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
    const { name, email, phone, title, order, workSchedule } = await request.json()

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id }
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Personel adı gereklidir' },
        { status: 400 }
      )
    }

    // Update staff
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        title: title?.trim() || null,
        order: parseInt(order) || 0,
        updatedAt: new Date()
      }
    })

    // Update work schedule if provided
    if (workSchedule && Array.isArray(workSchedule)) {
      // Delete existing work schedule
      await prisma.workSchedule.deleteMany({
        where: { staffId: id }
      })

      // Create new work schedule
      if (workSchedule.length > 0) {
        await Promise.all(
          workSchedule.map((schedule: {
            dayOfWeek: string
            isWorking: boolean
            startTime?: string
            endTime?: string
            interval?: number
            breakStart?: string
            breakEnd?: string
          }) => 
            prisma.workSchedule.create({
              data: {
                staffId: id,
                dayOfWeek: schedule.dayOfWeek as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
                isWorking: Boolean(schedule.isWorking),
                startTime: schedule.startTime || null,
                endTime: schedule.endTime || null,
                interval: parseInt(schedule.interval?.toString() || '30') || 30,
                breakStart: schedule.breakStart || null,
                breakEnd: schedule.breakEnd || null,
              }
            })
          )
        )
      }
    }

    return NextResponse.json({
      message: 'Personel başarıyla güncellendi',
      staff: updatedStaff
    })
  } catch (error) {
    console.error('Staff PUT error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Delete staff member
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

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
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

    if (!existingStaff) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    // Check if staff has active appointments
    if (existingStaff._count.appointments > 0) {
      return NextResponse.json(
        { error: 'Bu personelin aktif randevuları bulunmaktadır. Önce randevuları iptal edin.' },
        { status: 400 }
      )
    }

    // Delete staff (this will cascade delete work schedules and appointments)
    await prisma.staff.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Personel silindi' })
  } catch (error) {
    console.error('Staff DELETE error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
