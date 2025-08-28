'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AppointmentDeleteButton from '@/components/AppointmentDeleteButton'
import AppointmentCompleteButton from '@/components/AppointmentCompleteButton'
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
  XCircle
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
  const [dateFilter, setDateFilter] = useState('')

  // Filter appointments based on current filters  
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Status filter
      if (statusFilter && appointment.status !== statusFilter) {
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
                        {appointment.status === 'CONFIRMED' && (
                          <AppointmentCompleteButton 
                            appointmentId={appointment.id}
                            customerName={appointment.customerName}
                            date={appointment.date}
                            time={appointment.time}
                          />
                        )}
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
