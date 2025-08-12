import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '../../../../lib/session'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { staffId, dayOfWeek, isWorking, startTime, endTime, interval, breakStart, breakEnd } = body

    // Validation
    if (!staffId || !dayOfWeek) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    // Check if schedule already exists for this staff and day
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: {
        staffId_dayOfWeek: {
          staffId,
          dayOfWeek
        }
      }
    })

    if (existingSchedule) {
      return NextResponse.json({ error: 'Bu gün için zaten mesai saati tanımlanmış' }, { status: 400 })
    }

    // Verify staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    // Create work schedule
    const schedule = await prisma.workSchedule.create({
      data: {
        staffId,
        dayOfWeek,
        isWorking,
        startTime: isWorking ? startTime : null,
        endTime: isWorking ? endTime : null,
        interval: isWorking ? interval : null,
        breakStart: isWorking && breakStart ? breakStart : null,
        breakEnd: isWorking && breakEnd ? breakEnd : null
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')

    const whereClause = staffId ? { staffId } : {}

    const schedules = await prisma.workSchedule.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { staff: { name: 'asc' } },
        { dayOfWeek: 'asc' }
      ]
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Schedules fetch error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
