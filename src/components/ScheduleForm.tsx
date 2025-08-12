'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Save, X } from 'lucide-react'

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Pazartesi' },
  { key: 'TUESDAY', label: 'Salı' },
  { key: 'WEDNESDAY', label: 'Çarşamba' },
  { key: 'THURSDAY', label: 'Perşembe' },
  { key: 'FRIDAY', label: 'Cuma' },
  { key: 'SATURDAY', label: 'Cumartesi' },
  { key: 'SUNDAY', label: 'Pazar' }
] as const

interface Staff {
  id: string
  name: string
  workSchedule: Array<{
    id: string
    dayOfWeek: string
    isWorking: boolean
    startTime: string | null
    endTime: string | null
    interval: number | null
    breakStart: string | null
    breakEnd: string | null
  }>
}

interface ScheduleFormProps {
  staff: Staff
  schedule?: {
    id: string
    dayOfWeek: string
    isWorking: boolean
    startTime: string | null
    endTime: string | null
    interval: number | null
    breakStart: string | null
    breakEnd: string | null
  }
}

export default function ScheduleForm({ staff, schedule }: ScheduleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    dayOfWeek: schedule?.dayOfWeek || 'MONDAY',
    isWorking: schedule?.isWorking ?? true,
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '17:00',
    interval: schedule?.interval || 30,
    breakStart: schedule?.breakStart || '',
    breakEnd: schedule?.breakEnd || ''
  })

  // Get available days (days that don't have schedules yet)
  const availableDays = DAYS_OF_WEEK.filter(day => 
    !staff.workSchedule.some(ws => ws.dayOfWeek === day.key) || 
    schedule?.dayOfWeek === day.key
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const endpoint = schedule 
        ? `/api/admin/schedules/${schedule.id}` 
        : `/api/admin/schedules`
      
      const method = schedule ? 'PUT' : 'POST'
      
      const requestData = schedule 
        ? formData 
        : { ...formData, staffId: staff.id }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/schedules')
        router.refresh()
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Day of Week */}
        <div>
          <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
            Gün
          </label>
          <select
            id="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={schedule ? true : false}
          >
            {availableDays.map(day => (
              <option key={day.key} value={day.key}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Is Working */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isWorking}
              onChange={(e) => setFormData(prev => ({ ...prev, isWorking: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Çalışma günü</span>
          </label>
        </div>

        {formData.isWorking && (
          <>
            {/* Work Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Saati
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Saati
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Appointment Interval */}
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
                Randevu Aralığı (dakika)
              </label>
              <select
                id="interval"
                value={formData.interval}
                onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={15}>15 dakika</option>
                <option value={30}>30 dakika</option>
                <option value={45}>45 dakika</option>
                <option value={60}>60 dakika</option>
              </select>
            </div>

            {/* Break Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="breakStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Mola Başlangıcı (opsiyonel)
                </label>
                <input
                  type="time"
                  id="breakStart"
                  value={formData.breakStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakStart: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="breakEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  Mola Bitişi (opsiyonel)
                </label>
                <input
                  type="time"
                  id="breakEnd"
                  value={formData.breakEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakEnd: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {schedule ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
