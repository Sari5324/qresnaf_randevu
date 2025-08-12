import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
