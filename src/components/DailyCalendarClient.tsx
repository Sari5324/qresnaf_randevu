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

  // Dynamic time slots based on appointments
  const timeSlots = useMemo(() => {
    // Base time slots from 9:00 to 18:00
    const baseSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]

    // Get latest appointment time for current date
    const currentDateAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      const currentDateString = currentDate.toISOString().split('T')[0]
      const appointmentDateString = appointmentDate.toISOString().split('T')[0]
      return appointmentDateString === currentDateString
    })

    if (currentDateAppointments.length === 0) {
      return baseSlots
    }

    // Find the latest appointment time
    const latestTime = currentDateAppointments.reduce((latest, appointment) => {
      return appointment.time > latest ? appointment.time : latest
    }, '17:30')

    // Generate extended time slots if needed
    const extendedSlots = [...baseSlots]
    const latestHour = parseInt(latestTime.split(':')[0])
    const latestMinute = parseInt(latestTime.split(':')[1])

    // Extend to at least 30 minutes after the latest appointment
    let currentHour = 18
    let currentMinute = 0

    while (currentHour < latestHour || (currentHour === latestHour && currentMinute <= latestMinute + 30)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      if (!extendedSlots.includes(timeString)) {
        extendedSlots.push(timeString)
      }
      
      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
      
      // Safety limit - don't go beyond 23:30
      if (currentHour > 23) break
    }

    return extendedSlots.sort()
  }, [appointments, currentDate])

  // Staff colors
  const staffColors = [
    'bg-blue-500',
    'bg-purple-500', 
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]

  const getStaffColor = (staffName: string) => {
    const index = staffList.findIndex(staff => staff.name === staffName)
    return staffColors[index % staffColors.length] || 'bg-gray-500'
  }

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const statusMatch = !statusFilter || appointment.status === statusFilter
      const staffMatch = !staffFilter || appointment.staff.name === staffFilter
      
      // Filter by current date
      const appointmentDate = new Date(appointment.date)
      const currentDateString = currentDate.toISOString().split('T')[0]
      const appointmentDateString = appointmentDate.toISOString().split('T')[0]
      const dateMatch = appointmentDateString === currentDateString
      
      return statusMatch && staffMatch && dateMatch
    })
  }, [appointments, statusFilter, staffFilter, currentDate])

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
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Günlük Randevu Takvimi</h1>
              </div>
              
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
                    <div className="text-xs text-blue-600 font-medium">Bugün</div>
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
                  className="ml-2 px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bugün
                </button>
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

          {/* Staff Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Personel Renkleri</h3>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {staffList.map((staff, index) => (
                <div key={staff.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${staffColors[index % staffColors.length]}`}></div>
                  <span className="text-xs sm:text-sm text-gray-700">{staff.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Günlük Program
                </h2>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  {filteredAppointments.length} randevu
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-2 sm:p-4">
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
                        {timeAppointments.length > 0 ? (
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {timeAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className={`${getStaffColor(appointment.staff.name)} text-white rounded-lg p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] sm:min-w-[200px] shadow-sm hover:shadow-md transition-shadow`}
                              >
                                <div className="flex items-center justify-between mb-1 sm:mb-2">
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(appointment.status)}
                                    <span className="font-medium">{appointment.customerName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => window.location.href = `/admin/appointments/${appointment.id}/edit`}
                                      className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                                      title="Randevuyu Düzenle"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <AppointmentDeleteButton 
                                      appointmentId={appointment.id}
                                      customerName={appointment.customerName}
                                      date={appointment.date}
                                      time={appointment.time}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs opacity-90">
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{appointment.customerPhone}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{appointment.staff.name}</span>
                                  </div>
                                </div>
                                {appointment.notes && (
                                  <div className="mt-1 text-xs opacity-80 truncate">
                                    {appointment.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs sm:text-sm italic flex items-center h-full">
                            Boş
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

  )
}
