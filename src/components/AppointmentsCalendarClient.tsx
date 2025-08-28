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

interface AppointmentsCalendarClientProps {
  appointments: Appointment[]
  staffList: { id: string; name: string }[]
}

export default function AppointmentsCalendarClient({ appointments, staffList }: AppointmentsCalendarClientProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

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
    // Tarih formatını düzgün eşleştirmek için
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log('Looking for appointments on:', dateStr)
    console.log('Available dates:', Object.keys(appointmentsByDate))
    
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Randevu Takvimi</h1>
              <p className="text-gray-600 mt-2">Tüm randevuları takvim görünümünde yönetin</p>
            </div>
            <Link
              href="/admin/appointments/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Yeni fatih
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">Toplam</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-gray-600">Bekliyor</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-xs sm:text-sm text-gray-600">Onaylandı</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-xs sm:text-sm text-gray-600">İptal</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-gray-600">Tamamlandı</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Filtreler</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="PENDING">Bekliyor</option>
                  <option value="CONFIRMED">Onaylandı</option>
                  <option value="CANCELLED">İptal Edildi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Personel</label>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Personel</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center flex-grow sm:flex-grow-0">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Takvim Görünümü</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-2 sm:p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((date, index) => {
                  const dayAppointments = getDayAppointments(date)
                  const isCurrentMonthDay = isCurrentMonth(date)
                  const isTodayDay = isToday(date)
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] sm:min-h-[140px] p-1 sm:p-3 border-2 rounded-lg sm:rounded-xl transition-all hover:shadow-md ${
                        isCurrentMonthDay ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                      } ${isTodayDay ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className={`text-xs sm:text-sm font-bold mb-1 sm:mb-3 ${
                        isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                      } ${isTodayDay ? 'text-blue-600' : ''}`}>
                        {date.getDate()}
                        {isTodayDay && (
                          <span className="ml-1 text-xs bg-blue-500 text-white px-1 sm:px-2 py-0.5 rounded-full hidden sm:inline">
                            Bugün
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-0.5 sm:space-y-1">
                        {/* Mobile: Show first 2 appointments */}
                        <div className="sm:hidden">
                          {dayAppointments.slice(0, 2).map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`text-xs p-1 rounded-md cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${getStatusColor(appointment.status)}`}
                              title={`${appointment.time} - ${appointment.customerName} (${appointment.staff.name})`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(appointment.status)}
                                  <span className="font-semibold text-xs">
                                    {appointment.time}
                                  </span>
                                </div>
                              </div>
                              <div className="font-medium truncate text-xs">
                                {appointment.customerName}
                              </div>
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded-lg font-medium">
                              +{dayAppointments.length - 2}
                            </div>
                          )}
                        </div>
                        
                        {/* Desktop: Show first 3 appointments */}
                        <div className="hidden sm:block">
                          {dayAppointments.slice(0, 3).map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`text-xs p-2 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${getStatusColor(appointment.status)}`}
                              title={`${appointment.time} - ${appointment.customerName} (${appointment.staff.name})`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(appointment.status)}
                                  <span className="font-semibold text-xs">
                                    {appointment.time}
                                  </span>
                                </div>
                              </div>
                              <div className="font-medium truncate text-xs">
                                {appointment.customerName}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {appointment.staff.name}
                              </div>
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded-lg font-medium">
                              +{dayAppointments.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Appointment List (Below Calendar) */}
          {filteredAppointments.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detaylı Randevu Listesi ({filteredAppointments.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Randevu Alan
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
                    {filteredAppointments.slice(0, 10).map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono">
                            {appointment.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/appointments/${appointment.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
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
              {filteredAppointments.length > 10 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                  <span className="text-sm text-gray-600">
                    İlk 10 randevu gösteriliyor. Filtreleri kullanarak daraltabilirsiniz.
                  </span>
                </div>
              )}
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="mt-6 text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Randevu bulunamadı
              </h3>
              <p className="text-gray-500 mb-4">
                Seçilen filtrelere uygun randevu bulunmuyor.
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
      </main>
    </div>
  )
}
