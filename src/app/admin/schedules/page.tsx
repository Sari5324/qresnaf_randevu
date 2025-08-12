import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/session'
import AdminNav from '../../../components/AdminNav'
import AdminFoot from '../../../components/AdminFoot'
import ScheduleActions from '../../../components/ScheduleActions'
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import { Plus, Clock, Edit, Trash2 } from 'lucide-react'

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Pazartesi' },
  { key: 'TUESDAY', label: 'Salı' },
  { key: 'WEDNESDAY', label: 'Çarşamba' },
  { key: 'THURSDAY', label: 'Perşembe' },
  { key: 'FRIDAY', label: 'Cuma' },
  { key: 'SATURDAY', label: 'Cumartesi' },
  { key: 'SUNDAY', label: 'Pazar' }
] as const

export default async function WorkSchedulePage() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Get all staff with their work schedules
  const staffWithSchedules = await prisma.staff.findMany({
    include: {
      workSchedule: {
        orderBy: {
          dayOfWeek: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  const getDayLabel = (dayOfWeek: string) => {
    return DAYS_OF_WEEK.find(day => day.key === dayOfWeek)?.label || dayOfWeek
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds from HH:MM:SS format
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-6 md:px-0 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mesai Saatleri</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Personel çalışma saatlerini yönetin
                </p>
              </div>
              <Link 
                href="/admin/schedules/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Mesai Ekle
              </Link>
            </div>
          </div>

          {/* Staff Schedules */}
          <div className="px-6 md:px-0">
            {staffWithSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Personel bulunamadı</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Önce personel eklemeniz gerekiyor.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/users/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Personel Ekle
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {staffWithSchedules.map((staff) => (
                  <div key={staff.id} className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{staff.name}</h3>
                          <p className="text-sm text-gray-500">{staff.title || 'Personel'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/schedules/staff/${staff.id}/new`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Mesai Ekle
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {staff.workSchedule.length === 0 ? (
                        <div className="text-center py-6">
                          <Clock className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Bu personel için mesai saati tanımlanmamış
                          </p>
                          <div className="mt-4">
                            <Link
                              href={`/admin/schedules/staff/${staff.id}/new`}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              İlk Mesai Saatini Ekle
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {staff.workSchedule.map((schedule) => (
                            <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {getDayLabel(schedule.dayOfWeek)}
                                </h4>
                                <div className="flex space-x-1">
                                  <Link
                                    href={`/admin/schedules/${schedule.id}/edit`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  <ScheduleActions 
                                    scheduleId={schedule.id}
                                    staffName={staff.name}
                                    dayLabel={getDayLabel(schedule.dayOfWeek)}
                                  />
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Başlangıç:</span> {schedule.startTime ? formatTime(schedule.startTime) : '-'}
                                </p>
                                <p>
                                  <span className="font-medium">Bitiş:</span> {schedule.endTime ? formatTime(schedule.endTime) : '-'}
                                </p>
                                <p className="mt-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    schedule.isWorking 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {schedule.isWorking ? 'Aktif' : 'Pasif'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
