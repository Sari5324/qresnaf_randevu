import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import AnalyticsCleanup from '@/components/AnalyticsCleanup'
import { prisma } from '@/lib/prisma'
import { Calendar, MapPin, Eye, TrendingUp } from 'lucide-react'

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
    prisma.categoryView.deleteMany({
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
    totalViews,
    todayViews,
    last30DaysViews,
    locationViews,
    topCategories
  ] = await Promise.all([
    // Total views
    prisma.categoryView.count(),
    
    // Today views
    prisma.categoryView.count({
      where: {
        viewedAt: {
          gte: today
        }
      }
    }),
    
    // Last 30 days views
    prisma.categoryView.count({
      where: {
        viewedAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    
    // Location views
    prisma.categoryView.groupBy({
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
    
    // Top categories with names
    prisma.category.findMany({
      include: {
        _count: {
          select: { analytics: true }
        }
      },
      orderBy: {
        analytics: {
          _count: 'desc'
        }
      },
      take: 10
    })
  ])

  // Get recent views for timeline
  const recentViews = await prisma.categoryView.findMany({
    take: 20,
    orderBy: { viewedAt: 'desc' },
    include: {
      category: {
        select: { name: true }
      }
    }
  })

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
                  Kategori görüntüleme istatistikleri ve kullanıcı analizleri
                </p>
              </div>
              <div>
                <AnalyticsCleanup />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 md:px-0 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today Views */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bugün
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {todayViews} görüntüleme
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last 30 Days */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Son 30 Gün
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {last30DaysViews} görüntüleme
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Views */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {totalViews} görüntüleme
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-0">
            {/* Top Categories */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">En Çok Görüntülenen Kategoriler</h3>
              </div>
              <div className="p-6">
                {topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {topCategories.map((category, index) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category._count.analytics} görüntüleme</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz görüntüleme verisi yok</p>
                )}
              </div>
            </div>

            {/* Location Analytics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  Konum Bazlı Görüntülemeler
                </h3>
              </div>
              <div className="p-6">
                {locationViews.length > 0 ? (
                  <div className="space-y-4">
                    {locationViews.slice(0, 10).map((location, index) => (
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

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Son Aktiviteler</h3>
              </div>
              <div className="p-6">
                {recentViews.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {recentViews.map((view, index) => (
                        <li key={view.id}>
                          <div className="relative pb-8">
                            {index !== recentViews.length - 1 && (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                  <Eye className="h-4 w-4 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{view.category.name}</span> kategorisi görüntülendi
                                  </p>
                                  {view.location && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      <MapPin className="w-3 h-3 inline mr-1" />
                                      {view.location}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  {new Date(view.viewedAt).toLocaleDateString('tr-TR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
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
