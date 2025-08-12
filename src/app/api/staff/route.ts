import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all staff
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        workSchedule: true,
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
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { error: 'Personel listesi yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Create staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, title, order, workSchedule } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Personel adı gereklidir' },
        { status: 400 }
      )
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        title: title || null,
        order: order || 0
      }
    })

    // Create work schedule if provided
    if (workSchedule && workSchedule.length > 0) {
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
              staffId: staff.id,
              dayOfWeek: schedule.dayOfWeek as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
              isWorking: schedule.isWorking,
              startTime: schedule.startTime || null,
              endTime: schedule.endTime || null,
              interval: schedule.interval || 30,
              breakStart: schedule.breakStart || null,
              breakEnd: schedule.breakEnd || null,
            }
          })
        )
      )
    }

    return NextResponse.json(
      { 
        message: 'Personel başarıyla oluşturuldu',
        staff 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Staff creation error:', error)
    return NextResponse.json(
      { error: 'Personel oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
