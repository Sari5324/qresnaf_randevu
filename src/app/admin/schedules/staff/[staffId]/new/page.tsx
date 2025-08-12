import { redirect } from 'next/navigation'
import { getSession } from '../../../../../../lib/session'
import AdminNav from '../../../../../../components/AdminNav'
import AdminFoot from '../../../../../../components/AdminFoot'
import { prisma } from '../../../../../../lib/prisma'
import ScheduleForm from '../../../../../../components/ScheduleForm'

export default async function NewSchedulePage({ params }: { params: Promise<{ staffId: string }> }) {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const resolvedParams = await params
  
  // Get staff member
  const staff = await prisma.staff.findUnique({
    where: { id: resolvedParams.staffId },
    include: {
      workSchedule: true
    }
  })

  if (!staff) {
    redirect('/admin/schedules')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-6 md:px-0 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Yeni Mesai Saati Ekle</h1>
            <p className="mt-1 text-sm text-gray-500">
              {staff.name} için yeni mesai saati tanımlayın
            </p>
          </div>

          <div className="px-6 md:px-0">
            <ScheduleForm staff={staff} />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
