'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AppointmentDeleteButton from '@/components/AppointmentDeleteButton'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Plus, 
  Edit, 
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react'

interface Staff {
  name: string
  title: string
}

interface Appointment {
  id: string
  code: string
  customerName: string
  customerPhone: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
  staff: Staff
}

interface AppointmentsClientProps {
  appointments: Appointment[]
  staffList: { id: string; name: string }[]
}

export default function AppointmentsClient({ appointments, staffList }: AppointmentsClientProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Get current month/year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Helper functions
  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth, 1)
  }

  const getLastDayOfMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0)
  }

  const getCalendarDays = () => {
    const firstDay = getFirstDayOfMonth()
    const lastDay = getLastDayOfMonth()
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)
    
    // Start from Monday
    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))
    // End on Sunday
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Status filter
      if (statusFilter && appointment.status !== statusFilter) {
        return false
      }
      
      // Staff filter
      if (staffFilter && appointment.staff.name !== staffFilter) {
        return false
      }
      
      return true
    })
  }, [appointments, statusFilter, staffFilter])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Appointment[] } = {}
    
    filteredAppointments.forEach(appointment => {
      const dateKey = appointment.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })
    
    return grouped
  }, [filteredAppointments])

  // Get stats
  const stats = useMemo(() => {
    const total = filteredAppointments.length
    const pending = filteredAppointments.filter(a => a.status === 'PENDING').length
    const confirmed = filteredAppointments.filter(a => a.status === 'CONFIRMED').length
    const cancelled = filteredAppointments.filter(a => a.status === 'CANCELLED').length
    const completed = filteredAppointments.filter(a => a.status === 'COMPLETED').length
    
    return { total, pending, confirmed, cancelled, completed }
  }, [filteredAppointments])

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
        return 'İptal'
      case 'COMPLETED':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-3 h-3" />
      case 'CONFIRMED':
        return <CheckCircle className="w-3 h-3" />
      case 'CANCELLED':
        return <XCircle className="w-3 h-3" />
      case 'COMPLETED':
        return <CheckCircle className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDayAppointments = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointmentsByDate[dateStr] || []
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
        return false
      }
      
      // Date filter
      if (dateFilter && appointment.date !== dateFilter) {
        return false
      }
      
      // Staff filter
      if (staffFilter && appointment.staff.name !== staffFilter) {
        return false
      }
      
      return true
    })
  }, [appointments, statusFilter, dateFilter, staffFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Bekliyor
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Onaylandı
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            İptal Edildi
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tamamlandı
          </span>
        )
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* Header */}
      <div className="px-6 md:px-0 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Randevular</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tüm randevuları görüntüleyin ve yönetin
            </p>
          </div>
          <Link
            href="/admin/appointments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Randevu
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtreler</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select 
            value={staffFilter} 
            onChange={(e) => setStaffFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tüm Personel</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.name}>
                {staff.name}
              </option>
            ))}
          </select>
          {(statusFilter || dateFilter || staffFilter) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setDateFilter('')
                setStaffFilter('')
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Toplam {filteredAppointments.length} randevu {appointments.length !== filteredAppointments.length && `(${appointments.length} randevudan filtrelendi)`}
        </p>
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
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {appointments.length === 0 ? 'Henüz randevu bulunmuyor.' : 'Filtrelere uygun randevu bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {appointment.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.staff.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.staff.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {appointment.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/appointments/${appointment.id}/edit`}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Düzenle
                        </Link>
                        <AppointmentDeleteButton 
                          appointmentId={appointment.id}
                          customerName={appointment.customerName}
                          date={appointment.date}
                          time={appointment.time}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
