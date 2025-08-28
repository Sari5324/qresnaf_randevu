'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Briefcase, Calendar, Save } from 'lucide-react'

interface StaffFormProps {
  initialData?: {
    id?: string
    name: string
    email?: string | null
    phone?: string | null
    title?: string | null
    order: number
    workSchedule?: Array<{
      dayOfWeek: string
      isWorking: boolean
      startTime: string | null
      endTime: string | null
      interval: number | null
      breakStart: string | null
      breakEnd: string | null
    }>
  }
}

interface WorkScheduleDay {
  dayOfWeek: string
  isWorking: boolean
  startTime: string
  endTime: string
  interval: number
  breakStart: string
  breakEnd: string
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Pazartesi' },
  { key: 'TUESDAY', label: 'Salı' },
  { key: 'WEDNESDAY', label: 'Çarşamba' },
  { key: 'THURSDAY', label: 'Perşembe' },
  { key: 'FRIDAY', label: 'Cuma' },
  { key: 'SATURDAY', label: 'Cumartesi' },
  { key: 'SUNDAY', label: 'Pazar' }
]

export default function StaffForm({ initialData }: StaffFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    title: initialData?.title || '',
    order: initialData?.order || 1
  })

  const [workSchedule, setWorkSchedule] = useState<WorkScheduleDay[]>(() => {
    if (initialData?.workSchedule) {
      // Create a map of existing schedule data
      const existingSchedule = initialData.workSchedule.reduce((acc, schedule) => {
        acc[schedule.dayOfWeek] = schedule
        return acc
      }, {} as Record<string, {
        isWorking?: boolean
        startTime?: string | null
        endTime?: string | null
        interval?: number | null
        breakStart?: string | null
        breakEnd?: string | null
      }>)

      // Return complete schedule for all days
      return DAYS_OF_WEEK.map(day => {
        const existing = existingSchedule[day.key] as {
          isWorking?: boolean
          startTime?: string | null
          endTime?: string | null
          interval?: number | null
          breakStart?: string | null
          breakEnd?: string | null
        } | undefined
        return {
          dayOfWeek: day.key,
          isWorking: existing?.isWorking || false,
          startTime: existing?.startTime || '09:00',
          endTime: existing?.endTime || '17:00',
          interval: existing?.interval || 30,
          breakStart: existing?.breakStart || '12:00',
          breakEnd: existing?.breakEnd || '13:00'
        }
      })
    }

    return DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key,
      isWorking: false,
      startTime: '09:00',
      endTime: '17:00',
      interval: 30,
      breakStart: '12:00',
      breakEnd: '13:00'
    }))
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleScheduleChange = (dayIndex: number, field: string, value: string | boolean | number) => {
    setWorkSchedule(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.name.trim()) {
        setError('Personel adı gereklidir')
        setLoading(false)
        return
      }

      // Prepare data
      const submitData = {
        ...formData,
        order: parseInt(formData.order.toString()),
        workSchedule: workSchedule.filter(day => day.isWorking)
      }

      const url = initialData?.id ? `/api/staff/${initialData.id}` : '/api/staff'
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        router.push('/admin/staff')
      } else {
        const data = await response.json()
        setError(data.error || 'Bir hata oluştu')
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Temel Bilgiler
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Ünvan
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Berber, Kuaför"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 0532 123 45 67"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: ahmet@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Sıra
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Work Schedule */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Çalışma Saatleri
        </h3>
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={workSchedule[index].isWorking}
                    onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">{day.label}</span>
                </label>
              </div>

              {workSchedule[index].isWorking && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      value={workSchedule[index].startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Bitiş
                    </label>
                    <input
                      type="time"
                      value={workSchedule[index].endTime}
                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Randevu Aralığı
                    </label>
                    <select
                      value={workSchedule[index].interval}
                      onChange={(e) => handleScheduleChange(index, 'interval', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={30}>30 dakika</option>
                      <option value={60}>1 saat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Mola Başlangıç
                    </label>
                    <input
                      type="time"
                      value={workSchedule[index].breakStart}
                      onChange={(e) => handleScheduleChange(index, 'breakStart', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Mola Bitiş
                    </label>
                    <input
                      type="time"
                      value={workSchedule[index].breakEnd}
                      onChange={(e) => handleScheduleChange(index, 'breakEnd', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Kaydediliyor...' : initialData?.id ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
