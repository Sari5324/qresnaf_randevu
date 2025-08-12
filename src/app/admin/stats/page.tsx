import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/session'
import AdminNav from '../../../components/AdminNav'
import AdminFoot from '../../../components/AdminFoot'
import AnalyticsCleanup from '../../../components/AnalyticsCleanup'
import { prisma } from '../../../lib/prisma'
import { Calendar, Clock, TrendingUp, CheckCircle, Eye, MapPin } from 'lucide-react'

export default async function StatsPage() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Date calculations
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all analytics data in parallel
  const [
    totalAppointments,
    todayAppointments, 
    last30DaysAppointments,
    appointmentsByStatus,
    totalViews,
    todayViews,
    last30DaysViews,
    locationViews
  ] = await Promise.all([
    // Total appointments
    prisma.appointment.count(),
    
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
    }),

    // Appointments grouped by status
    prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    }),

    // Total page views
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

    // Views by location (last 30 days)
    prisma.appointmentView.groupBy({
      by: ['location'],
      where: {
        viewedAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })
  ])

  // Prepare status counts with defaults
  const statusCounts = {
    PENDING: appointmentsByStatus.find(s => s.status === 'PENDING')?._count.id || 0,
    CONFIRMED: appointmentsByStatus.find(s => s.status === 'CONFIRMED')?._count.id || 0,
    CANCELLED: appointmentsByStatus.find(s => s.status === 'CANCELLED')?._count.id || 0,
    COMPLETED: appointmentsByStatus.find(s => s.status === 'COMPLETED')?._count.id || 0,
  }

  // Get recent appointments for timeline
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
      case 'PENDING': return 'Bekliyor'
      case 'CONFIRMED': return 'Onaylandı'
      case 'CANCELLED': return 'İptal Edildi'
      case 'COMPLETED': return 'Tamamlandı'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-600'
      case 'CONFIRMED': return 'bg-green-100 text-green-600'
      case 'CANCELLED': return 'bg-red-100 text-red-600'
      case 'COMPLETED': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

          <div className="px-6 md:px-0 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Randevu İstatistikleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam Randevu
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {totalAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bugün
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {todayAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Son 30 Gün
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {last30DaysAppointments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Onaylanan
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statusCounts.CONFIRMED}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-0 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sayfa Görüntüleme İstatistikleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam Görüntüleme
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {totalViews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
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

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Son 30 Gün Görüntüleme
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {last30DaysViews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Randevu Durumları</h3>
              </div>
              <div className="p-6">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Konum Bazlı Görüntülemeler</h3>
                <p className="text-sm text-gray-500">Son 30 gün</p>
              </div>
              <div className="p-6">
                {locationViews.length > 0 ? (
                  <div className="space-y-3">
                    {locationViews.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 truncate">
                            {location.location || 'Bilinmeyen'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {location._count.id}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Henüz konum verisi yok</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-0 mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Son Randevular</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oluşturulma
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.staff.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.date)} {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(appointment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
