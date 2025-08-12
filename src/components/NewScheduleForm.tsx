'use client'

import { useState } from 'react'
import { User, Clock, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string
  title?: string | null
}

interface NewScheduleFormProps {
  staff: Staff[]
}

export default function NewScheduleForm({ staff }: NewScheduleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isWorking: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const daysOfWeek = [
    { value: 'monday', label: 'Pazartesi' },
    { value: 'tuesday', label: 'Salı' },
    { value: 'wednesday', label: 'Çarşamba' },
    { value: 'thursday', label: 'Perşembe' },
    { value: 'friday', label: 'Cuma' },
    { value: 'saturday', label: 'Cumartesi' },
    { value: 'sunday', label: 'Pazar' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.staffId) {
      newErrors.staffId = 'Personel seçimi gereklidir'
    }

    if (!formData.dayOfWeek) {
      newErrors.dayOfWeek = 'Gün seçimi gereklidir'
    }

    if (formData.isWorking) {
      if (!formData.startTime) {
        newErrors.startTime = 'Başlangıç saati gereklidir'
      }

      if (!formData.endTime) {
        newErrors.endTime = 'Bitiş saati gereklidir'
      }

      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Bitiş saati başlangıç saatinden sonra olmalıdır'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/admin/schedules')
      } else {
        setErrors({ submit: result.error || 'Mesai saati oluşturulurken bir hata oluştu' })
      }
    } catch {
      setErrors({ submit: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staff Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Personel Seçimi *
          </label>
          <select
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.staffId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Personel seçiniz</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.title && `- ${member.title}`}
              </option>
            ))}
          </select>
          {errors.staffId && (
            <p className="text-red-500 text-sm mt-1">{errors.staffId}</p>
          )}
        </div>

        {/* Day of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gün *
          </label>
          <select
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dayOfWeek ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Gün seçiniz</option>
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <p className="text-red-500 text-sm mt-1">{errors.dayOfWeek}</p>
          )}
        </div>

        {/* Working Status */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Çalışma Durumu
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="isWorking"
                value="true"
                checked={formData.isWorking === true}
                onChange={() => setFormData({ ...formData, isWorking: true })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Çalışıyor</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isWorking"
                value="false"
                checked={formData.isWorking === false}
                onChange={() => setFormData({ ...formData, isWorking: false })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Çalışmıyor</span>
            </label>
          </div>
        </div>

        {formData.isWorking && (
          <>
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Başlangıç Saati *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Bitiş Saati *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Mesai Saati Oluştur
            </>
          )}
        </button>
      </div>
    </form>
  )
}
