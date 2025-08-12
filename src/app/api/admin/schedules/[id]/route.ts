import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '../../../../../lib/session'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const resolvedParams = await params
    const schedule = await prisma.workSchedule.findUnique({
      where: { id: resolvedParams.id },
      include: {
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Mesai saati bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { dayOfWeek, isWorking, startTime, endTime, interval, breakStart, breakEnd } = body

    // Check if schedule exists
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Mesai saati bulunamadı' }, { status: 404 })
    }

    // If changing day, check for conflicts
    if (dayOfWeek !== existingSchedule.dayOfWeek) {
      const conflictingSchedule = await prisma.workSchedule.findUnique({
        where: {
          staffId_dayOfWeek: {
            staffId: existingSchedule.staffId,
            dayOfWeek
          }
        }
      })

      if (conflictingSchedule) {
        return NextResponse.json({ error: 'Bu gün için zaten mesai saati tanımlanmış' }, { status: 400 })
      }
    }

    // Update work schedule
    const schedule = await prisma.workSchedule.update({
      where: { id: resolvedParams.id },
      data: {
        dayOfWeek,
        isWorking,
        startTime: isWorking ? startTime : null,
        endTime: isWorking ? endTime : null,
        interval: isWorking ? interval : null,
        breakStart: isWorking && breakStart ? breakStart : null,
        breakEnd: isWorking && breakEnd ? breakEnd : null
      }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Schedule update error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const resolvedParams = await params
    
    // Check if schedule exists
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Mesai saati bulunamadı' }, { status: 404 })
    }

    // Delete work schedule
    await prisma.workSchedule.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Mesai saati silindi' })
  } catch (error) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
