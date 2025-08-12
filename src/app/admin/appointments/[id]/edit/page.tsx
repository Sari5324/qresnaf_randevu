import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { prisma } from '@/lib/prisma'
import AppointmentEditForm from '@/components/AppointmentEditForm'

export default async function EditAppointmentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
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

  const { id } = await params

  // Get appointment with staff info
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          title: true
        }
      }
    }
  })

  if (!appointment) {
    notFound()
  }

  // Get all staff for dropdown
  const staff = await prisma.staff.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-6 md:px-0 mb-8">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Randevu Düzenle</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Randevu bilgilerini güncelleyin
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Edit Form */}
          <div className="px-6 md:px-0">
            <AppointmentEditForm 
              appointment={{
                ...appointment,
                date: appointment.date.toISOString().split('T')[0]
              }}
              staff={staff}
            />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
