import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '../send-sms/route'

// Create appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, staffId, date, time, notes } = body

    // Validation
    if (!customerName || !customerPhone || !staffId || !date || !time) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurunuz' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const cleanPhone = customerPhone.replace(/\s/g, '')
    if (!/^(\+90|0)?[5][0-9]{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz' },
        { status: 400 }
      )
    }

    // Check if customer already has an active appointment
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        customerPhone: cleanPhone,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Bu telefon numarası ile aktif bir randevunuz bulunmaktadır. Önce mevcut randevunuzu iptal ediniz.' },
        { status: 400 }
      )
    }

    // Check if the date/time is in the past
    const appointmentDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()
    
    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: 'Geçmiş tarih ve saatlerde randevu alınamaz' },
        { status: 400 }
      )
    }

    // Check if staff member is available at that time
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: new Date(date),
        time,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Seçilen tarih ve saatte bu personel için randevu mevcuttur' },
        { status: 400 }
      )
    }

    // Check staff work schedule
    const appointmentDate = new Date(date)
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][appointmentDate.getDay()]
    
    const workSchedule = await prisma.workSchedule.findFirst({
      where: {
        staffId,
        dayOfWeek: dayOfWeek as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
        isWorking: true
      }
    })

    if (!workSchedule || !workSchedule.startTime || !workSchedule.endTime) {
      return NextResponse.json(
        { error: 'Seçilen personel bu günde çalışmamaktadır' },
        { status: 400 }
      )
    }

    // Check if appointment time is within working hours
    const appointmentTimeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
    const startTimeMinutes = parseInt(workSchedule.startTime.split(':')[0]) * 60 + parseInt(workSchedule.startTime.split(':')[1])
    const endTimeMinutes = parseInt(workSchedule.endTime.split(':')[0]) * 60 + parseInt(workSchedule.endTime.split(':')[1])

    if (appointmentTimeMinutes < startTimeMinutes || appointmentTimeMinutes >= endTimeMinutes) {
      return NextResponse.json(
        { error: `Seçilen personel ${workSchedule.startTime} - ${workSchedule.endTime} saatleri arasında çalışmaktadır` },
        { status: 400 }
      )
    }

    // Check if appointment time is during break
    if (workSchedule.breakStart && workSchedule.breakEnd) {
      const breakStartMinutes = parseInt(workSchedule.breakStart.split(':')[0]) * 60 + parseInt(workSchedule.breakStart.split(':')[1])
      const breakEndMinutes = parseInt(workSchedule.breakEnd.split(':')[0]) * 60 + parseInt(workSchedule.breakEnd.split(':')[1])
      
      if (appointmentTimeMinutes >= breakStartMinutes && appointmentTimeMinutes < breakEndMinutes) {
        return NextResponse.json(
          { error: `Seçilen saat mola zamanında (${workSchedule.breakStart} - ${workSchedule.breakEnd})` },
          { status: 400 }
        )
      }
    }

    // Generate 6-digit appointment code
    let code: string
    let codeExists = true
    
    while (codeExists) {
      code = Math.floor(100000 + Math.random() * 900000).toString()
      const existingCode = await prisma.appointment.findUnique({
        where: { code }
      })
      codeExists = !!existingCode
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        code: code!,
        customerName,
        customerPhone: cleanPhone,
        staffId,
        date: new Date(date),
        time,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        staff: {
          select: {
            name: true,
            title: true
          }
        }
      }
    })

    // SMS gönder (opsiyonel - hata olsa bile randevu oluşturulur)
    try {
      const smsResult = await sendSms(cleanPhone, appointment.code, customerName)
      if (smsResult.success) {
        console.log('SMS başarıyla gönderildi:', smsResult.message)
      } else {
        console.error('SMS gönderilemedi:', smsResult.message)
      }
    } catch (smsError) {
      console.error('SMS gönderme hatası:', smsError)
      // SMS hatası randevu oluşturma işlemini engellemez
    }

    return NextResponse.json(
      { 
        message: 'Randevu başarıyla oluşturuldu',
        code: appointment.code,
        appointment 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json(
      { error: 'Randevu oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Get appointments (for admin and availability check)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')

    let whereClause: Record<string, unknown> = {}

    // If staffId and date are provided, filter for availability check
    if (staffId && date) {
      whereClause = {
        staffId,
        date: new Date(date),
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            name: true,
            title: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Randevular yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
