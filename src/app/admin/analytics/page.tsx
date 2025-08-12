import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import AnalyticsCleanup from '@/components/AnalyticsCleanup'
import { prisma } from '@/lib/prisma'
import { Calendar, MapPin, Eye, TrendingUp, Users } from 'lucide-react'

export default async function AnalyticsPage() {
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

  // Auto-cleanup old records (older than 30 days) - non-blocking
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Delete old records silently in background
    prisma.appointmentView.deleteMany({
      where: {
        viewedAt: {
          lt: thirtyDaysAgo
        }
      }
    }).catch(err => console.error('Auto-cleanup failed:', err))
  } catch (error) {
    // Silent fail - don't break analytics page
    console.error('Auto-cleanup error:', error)
  }

  // Get current date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get analytics data
  const [
    ,// totalViews - not used in display but kept for future use
    todayViews,
    last30DaysViews,
    locationViews,
    appointmentStats,
    todayAppointments,
    last30DaysAppointments
  ] = await Promise.all([
    // Total views
    prisma.appointmentView.count(),
    
    // Today views
    prisma.appointmentView.count({
      where: {
        viewedAt: {
          gte: today
        }
      }
    }),
    
    // Last 30 days views
    prisma.appointmentView.count({
      where: {
        viewedAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    
    // Location views
    prisma.appointmentView.groupBy({
      by: ['location'],
      _count: {
        id: true
      },
      where: {
        location: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    }),
    
    // Appointment statistics by status
    prisma.appointment.groupBy({
      by: ['status'],
      _count: true
    }),

    // Today appointments
    prisma.appointment.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    }),

    // Last 30 days appointments
    prisma.appointment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })
  ])

  // Get recent views for timeline
  const recentViews = await prisma.appointmentView.findMany({
    take: 20,
    orderBy: { viewedAt: 'desc' }
  })

  // Get recent appointments
  const recentAppointments = await prisma.appointment.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      staff: {
        select: { name: true }
      }
    }
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor'
      case 'CONFIRMED':
        return 'Onaylandı'
      case 'CANCELLED':
        return 'İptal Edildi'
      case 'COMPLETED':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-600'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-600'
      case 'CANCELLED':
        return 'bg-red-100 text-red-600'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
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
                <h1 className="text-3xl font-bold text-gray-900">Analizler</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Randevu ve site görüntüleme istatistikleri
                </p>
              </div>
              <div>
                <AnalyticsCleanup />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 md:px-0 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Today Views */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bugün Görüntüleme
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {todayViews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today Appointments */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bugün Randevu
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {todayAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last 30 Days Views */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          30 Gün Görüntüleme
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {last30DaysViews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last 30 Days Appointments */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          30 Gün Randevu
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {last30DaysAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-0">
            {/* Appointment Status Statistics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Randevu Durumları</h3>
              </div>
              <div className="p-6">
                {appointmentStats.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentStats.map((stat) => (
                      <div key={stat.status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(stat.status)}`}></div>
                          <span className="text-sm font-medium text-gray-900">
                            {getStatusText(stat.status)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{stat._count} randevu</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz randevu verisi yok</p>
                )}
              </div>
            </div>

            {/* Location Analytics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Konum Bazlı Görüntülemeler
                </h3>
              </div>
              <div className="p-6">
                {locationViews.length > 0 ? (
                  <div className="space-y-4">
                    {locationViews.slice(0, 8).map((location, index) => (
                      <div key={location.location} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm mr-3">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {location.location || 'Bilinmeyen'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{location._count.id} görüntüleme</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz konum verisi yok</p>
                )}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Son Randevular</h3>
              </div>
              <div className="p-6">
                {recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.staff.name} - {appointment.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz randevu verisi yok</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Son Site Ziyaretleri</h3>
              </div>
              <div className="p-6">
                {recentViews.length > 0 ? (
                  <div className="space-y-4">
                    {recentViews.slice(0, 8).map((view) => (
                      <div key={view.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">
                              {view.appointmentId ? 'Randevu görüntülendi' : 'Ana sayfa ziyareti'}
                            </p>
                            {view.location && (
                              <p className="text-xs text-gray-400">
                                {view.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {new Date(view.viewedAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz aktivite verisi yok</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}