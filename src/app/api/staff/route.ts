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
    const { name, email, phone, title, order } = body

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

    // Create default work schedule (Monday-Friday, 9-17)
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    
    await Promise.all(
      days.map(day => {
        const isWeekend = day === 'SATURDAY' || day === 'SUNDAY'
        return prisma.workSchedule.create({
          data: {
            staffId: staff.id,
            dayOfWeek: day as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
            isWorking: !isWeekend,
            startTime: !isWeekend ? '09:00' : null,
            endTime: !isWeekend ? '17:00' : null,
            interval: !isWeekend ? 30 : null,
            breakStart: !isWeekend ? '12:00' : null,
            breakEnd: !isWeekend ? '13:00' : null,
          }
        })
      })
    )

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
