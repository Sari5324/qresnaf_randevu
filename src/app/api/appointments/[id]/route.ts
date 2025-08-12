import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// PUT - Update appointment (admin)
export async function PUT(
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
    const { customerName, customerPhone, staffId, date, time, notes, status } = await request.json()

    // Validation
    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: 'Müşteri adı gereklidir' },
        { status: 400 }
      )
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json(
        { error: 'Telefon numarası gereklidir' },
        { status: 400 }
      )
    }

    if (!staffId) {
      return NextResponse.json(
        { error: 'Personel seçimi gereklidir' },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Tarih gereklidir' },
        { status: 400 }
      )
    }

    if (!time) {
      return NextResponse.json(
        { error: 'Saat gereklidir' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      )
    }

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Personel bulunamadı' },
        { status: 404 }
      )
    }

    // Check for time conflicts (only if date/time/staff changed)
    if (
      existingAppointment.date !== date || 
      existingAppointment.time !== time || 
      existingAppointment.staffId !== staffId
    ) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          staffId,
          date,
          time,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          id: {
            not: id // Exclude current appointment
          }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Bu saatte zaten bir randevu bulunuyor' },
          { status: 400 }
        )
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        staffId,
        date,
        time,
        notes: notes?.trim() || null,
        status
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

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Randevu başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Appointment update error:', error)
    return NextResponse.json(
      { error: 'Randevu güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, customerName, customerPhone, staffId, date, time, notes } = body

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    // If only status is being updated (cancel operation)
    if (status && Object.keys(body).length === 1) {
      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          staff: {
            select: {
              name: true,
              title: true
            }
          }
        }
      })

      return NextResponse.json({ 
        message: 'Randevu durumu güncellendi',
        appointment: updatedAppointment 
      })
    }

    // Full appointment update (admin operation)
    const updateData: Record<string, unknown> = {}
    
    if (customerName !== undefined) updateData.customerName = customerName
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone
    if (staffId !== undefined) updateData.staffId = staffId
    if (date !== undefined) updateData.date = new Date(date)
    if (time !== undefined) updateData.time = time
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status

    // If date/time is being updated, validate conflicts
    if (date || time || staffId) {
      const checkDate = date ? new Date(date) : existingAppointment.date
      const checkTime = time || existingAppointment.time
      const checkStaffId = staffId || existingAppointment.staffId

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          staffId: checkStaffId,
          date: checkDate,
          time: checkTime,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Seçilen tarih ve saatte bu personel için başka bir randevu mevcuttur' },
          { status: 400 }
        )
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        staff: {
          select: {
            name: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Randevu güncellendi',
      appointment: updatedAppointment 
    })

  } catch (error) {
    console.error('Appointment update error:', error)
    return NextResponse.json(
      { error: 'Randevu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Randevu silindi' })

  } catch (error) {
    console.error('Appointment delete error:', error)
    return NextResponse.json(
      { error: 'Randevu silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Randevu yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
