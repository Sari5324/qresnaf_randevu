import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import NewScheduleForm from '@/components/NewScheduleForm'

export default async function NewSchedulePage() {
  // Authentication check
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  
  if (!sessionCookie) {
    redirect('/admin/login')
  }

  const session = parseSessionToken(sessionCookie)
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Get staff members
  const staff = await prisma.staff.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-3xl mx-auto py-6 px-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/admin/schedules"
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Yeni Mesai Saati</h1>
                <p className="text-gray-600 mt-2">Personel için mesai saati tanımlayın</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <NewScheduleForm staff={staff} />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
