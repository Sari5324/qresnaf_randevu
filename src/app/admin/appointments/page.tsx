import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import AppointmentDeleteButton from '@/components/AppointmentDeleteButton'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react'

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

  // Get stats
  const stats = await prisma.appointment.groupBy({
    by: ['status'],
    _count: true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100'
      case 'CONFIRMED':
        return 'text-green-700 bg-green-100'
      case 'CANCELLED':
        return 'text-red-700 bg-red-100'
      case 'COMPLETED':
        return 'text-blue-700 bg-blue-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-7xl mx-auto py-6 px-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Randevular</h1>
              <p className="text-gray-600 mt-2">Tüm randevuları görüntüleyin ve yönetin</p>
            </div>
            <Link
              href="/admin/appointments/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni Randevu
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.status} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getStatusText(stat.status)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stat._count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${getStatusColor(stat.status)}`}>
                    {getStatusIcon(stat.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium text-gray-900">Filtreler</h3>
            </div>
            <div className="flex gap-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Bekliyor</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="CANCELLED">İptal Edildi</option>
                <option value="COMPLETED">Tamamlandı</option>
              </select>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Tüm Personel</option>
                {/* TODO: Add staff options */}
              </select>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hasta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih & Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kod
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.customerName}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {appointment.customerPhone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.staff.name}
                        </div>
                        {appointment.staff.title && (
                          <div className="text-sm text-gray-500">
                            {appointment.staff.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.date.toString())}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {appointment.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/appointments/${appointment.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <AppointmentDeleteButton
                            appointmentId={appointment.id}
                            customerName={appointment.customerName}
                            date={new Date(appointment.date).toLocaleDateString('tr-TR')}
                            time={appointment.time}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {appointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz randevu bulunmuyor
                </h3>
                <p className="text-gray-500 mb-4">
                  İlk randevuyu oluşturmak için aşağıdaki butona tıklayın.
                </p>
                <Link
                  href="/admin/appointments/new"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Randevu
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
