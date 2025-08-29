import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import DailyCalendarClient from '@/components/DailyCalendarClient'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { prisma } from '@/lib/prisma'

export default async function AdminAppointments() {
  // Get session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  
  if (!sessionCookie) {
    redirect('/admin/login')
  }

  const session = parseSessionToken(sessionCookie)
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Get appointments with staff info
  const appointments = await prisma.appointment.findMany({
    include: {
      staff: {
        select: {
          name: true,
          title: true
        }
      }
    },
    orderBy: [
      { date: 'desc' },
      { time: 'asc' }
    ]
  })

  // Get staff list for filter
  const staffList = await prisma.staff.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Transform appointments to match expected format
  const transformedAppointments = appointments.map(appointment => ({
    ...appointment,
    date: appointment.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
    notes: appointment.notes || undefined, // Convert null to undefined
    staff: {
      ...appointment.staff,
      title: appointment.staff.title || ''
    }
  }))

  // Calculate statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    todayTotal: 0,
    thisWeekTotal: 0,
    thisMonthTotal: 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <DailyCalendarClient appointments={transformedAppointments} staffList={staffList} stats={stats} />
      <AdminFoot />
    </div>
  )
}
