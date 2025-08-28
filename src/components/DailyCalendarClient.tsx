'use client'

import { useState, useMemo } from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Plus,
  Edit
} from 'lucide-react'
import AppointmentDeleteButton from './AppointmentDeleteButton'

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

interface DailyCalendarClientProps {
  appointments: Appointment[]
  staffList: { id: string; name: string }[]
}

export default function DailyCalendarClient({ appointments, staffList }: DailyCalendarClientProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointmentData, setAppointmentData] = useState(appointments)

  // Only show time slots that have appointments
  const timeSlots = useMemo(() => {
    // Get appointments for current date
    const currentDateAppointments = appointmentData.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      const currentDateString = currentDate.toISOString().split('T')[0]
      const appointmentDateString = appointmentDate.toISOString().split('T')[0]
      return appointmentDateString === currentDateString
    })

    if (currentDateAppointments.length === 0) {
      return []
    }

    // Get unique time slots from appointments and sort them
    const appointmentTimes = [...new Set(currentDateAppointments.map(app => app.time))].sort()
    return appointmentTimes
  }, [appointmentData, currentDate])

  // Get status-based colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500 border-yellow-600'
      case 'CONFIRMED':
        return 'bg-green-500 border-green-600'
      case 'CANCELLED':
        return 'bg-red-500 border-red-600'
      case 'COMPLETED':
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }



  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointmentData.filter(appointment => {
      const statusMatch = !statusFilter || appointment.status === statusFilter
      const staffMatch = !staffFilter || appointment.staff.name === staffFilter
      
      // Filter by current date
      const appointmentDate = new Date(appointment.date)
      const currentDateString = currentDate.toISOString().split('T')[0]
      const appointmentDateString = appointmentDate.toISOString().split('T')[0]
      const dateMatch = appointmentDateString === currentDateString
      
      return statusMatch && staffMatch && dateMatch
    })
  }, [appointmentData, statusFilter, staffFilter, currentDate])

  // Get appointments for a specific time slot
  const getAppointmentsForTime = (time: string) => {
    return filteredAppointments.filter(appointment => appointment.time === time)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-3 h-3 text-yellow-600" />
      case 'CONFIRMED':
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-3 h-3 text-red-600" />
      case 'COMPLETED':
        return <PlayCircle className="w-3 h-3 text-blue-600" />
      default:
        return <Clock className="w-3 h-3 text-gray-600" />
    }
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = () => {
    const today = new Date()
    return currentDate.toDateString() === today.toDateString()
  }

  return (
    <div className="flex-grow">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Günlük Randevu Takvimi</h1>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {/* Add Appointment Button */}
                <button
                  onClick={() => window.location.href = '/admin/appointments/new'}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Randevu
                </button>
                
                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateDay('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <div className="text-center min-w-[200px] sm:min-w-[300px]">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {formatDate(currentDate)}
                    </div>
                    {isToday() && (
                      <div className="text-xs text-green-600 font-medium">Bugün</div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigateDay('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="ml-2 px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Bugün
                  </button>
                </div>
              </div>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {/* Status Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Randevu Durumları</h3>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Bekliyor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Onaylandı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">İptal Edildi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Tamamlandı</span>
              </div>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Günlük Program
                </h2>
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  {filteredAppointments.length} randevu
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-2 sm:p-4">
              {timeSlots.length > 0 ? (
                <div className="space-y-1">
                  {timeSlots.map((time) => {
                    const timeAppointments = getAppointmentsForTime(time)
                    
                    return (
                      <div key={time} className="flex border-b border-gray-100 last:border-b-0">
                        {/* Time Column */}
                        <div className="w-16 sm:w-20 py-2 sm:py-3 px-2 bg-gray-50 text-xs sm:text-sm font-medium text-gray-600 text-center">
                          {time}
                        </div>
                        
                        {/* Appointments Column */}
                        <div className="flex-1 py-2 sm:py-3 px-2 sm:px-4 min-h-[40px] sm:min-h-[50px]">
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {timeAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className={`${getStatusColor(appointment.status)} text-white rounded-xl p-3 sm:p-4 text-xs sm:text-sm min-w-[160px] sm:min-w-[220px] shadow-lg hover:shadow-xl transition-all duration-200 border-2 hover:scale-[1.02] transform`}
                              >
                                {/* Header with Code and Status */}
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                                      <span className="font-bold text-xs">{appointment.code}</span>
                                    </div>
                                    {getStatusIcon(appointment.status)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {appointment.status === 'PENDING' && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(`/api/appointments/${appointment.id}`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ status: 'CONFIRMED' })
                                            })
                                            if (response.ok) {
                                              // Update state instead of reloading
                                              setAppointmentData(prev => 
                                                prev.map(apt => 
                                                  apt.id === appointment.id 
                                                    ? { ...apt, status: 'CONFIRMED' as const }
                                                    : apt
                                                )
                                              )
                                            }
                                          } catch (error) {
                                            console.error('Error confirming appointment:', error)
                                          }
                                        }}
                                        className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                                        title="Randevuyu Onayla"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => window.location.href = `/admin/appointments/${appointment.id}/edit`}
                                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                                      title="Randevuyu Düzenle"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <AppointmentDeleteButton 
                                      appointmentId={appointment.id}
                                      customerName={appointment.customerName}
                                      date={appointment.date}
                                      time={appointment.time}
                                      onDelete={() => {
                                        setAppointmentData(prev => 
                                          prev.filter(apt => apt.id !== appointment.id)
                                        )
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Customer Name - Prominent */}
                                <div className="mb-2 sm:mb-3">
                                  <h4 className="font-bold text-sm sm:text-base text-white">
                                    {appointment.customerName}
                                  </h4>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-1.5 text-xs opacity-95">
                                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    <span className="font-medium">{appointment.customerPhone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    <span className="font-medium">{appointment.staff.name}</span>
                                  </div>
                                </div>

                                {/* Notes - if any */}
                                {appointment.notes && (
                                  <div className="mt-2 text-xs bg-white/10 rounded-lg px-2 py-1.5 opacity-90">
                                    <span className="italic">&ldquo;{appointment.notes}&rdquo;</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                  )
                })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Bu gün için randevu bulunmuyor</p>
                  <p className="text-sm">Başka bir gün seçin veya yeni randevu oluşturun</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

  )
}
