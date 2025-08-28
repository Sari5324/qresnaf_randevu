import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/session'

// GET - Get specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
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
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
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

    // Update staff in a transaction
    const updatedStaff = await prisma.$transaction(async (tx) => {
      // Update basic staff info
      const staff = await tx.staff.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          title,
          order
        }
      })

      // Delete existing work schedules
      await tx.workSchedule.deleteMany({
        where: { staffId: id }
      })

      // Create new work schedules
      if (workSchedule && workSchedule.length > 0) {
        await tx.workSchedule.createMany({
          data: workSchedule.map((schedule: {
            dayOfWeek: string;
            isWorking: boolean;
            startTime?: string;
            endTime?: string;
            interval?: number;
            breakStart?: string;
            breakEnd?: string;
          }) => ({
            staffId: id,
            dayOfWeek: schedule.dayOfWeek,
            isWorking: schedule.isWorking,
            startTime: schedule.isWorking ? schedule.startTime : null,
            endTime: schedule.isWorking ? schedule.endTime : null,
            interval: schedule.isWorking ? schedule.interval : null,
            breakStart: schedule.isWorking && schedule.breakStart ? schedule.breakStart : null,
            breakEnd: schedule.isWorking && schedule.breakEnd ? schedule.breakEnd : null
          }))
        })
      }

      return staff
    })

    return NextResponse.json(updatedStaff)
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
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params

    // Check if staff has active appointments
    const activeAppointments = await prisma.appointment.count({
      where: {
        staffId: id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (activeAppointments > 0) {
      return NextResponse.json(
        { error: 'Bu personelin aktif randevuları bulunmaktadır. Önce randevuları iptal ediniz.' },
        { status: 400 }
      )
    }

    // Delete staff and related data
    await prisma.$transaction(async (tx) => {
      // Delete work schedules
      await tx.workSchedule.deleteMany({
        where: { staffId: id }
      })

      // Delete staff
      await tx.staff.delete({
        where: { id }
      })
    })

    return NextResponse.json({ 
      message: 'Personel başarıyla silindi' 
    })
  } catch (error) {
    console.error('Staff DELETE error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
