'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Send, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string
  title?: string | null
}

interface NewAppointmentFormProps {
  staff: Staff[]
}

export default function NewAppointmentForm({ staff }: NewAppointmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    staffId: '',
    date: '',
    time: '',
    notes: '',
    status: 'PENDING'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Generate time slots (9:00 - 17:00 with 30 min intervals)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Müşteri adı gereklidir'
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefon numarası gereklidir'
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Geçerli bir telefon numarası girin'
    }

    if (!formData.staffId) {
      newErrors.staffId = 'Personel seçimi gereklidir'
    }

    if (!formData.date) {
      newErrors.date = 'Tarih seçimi gereklidir'
    }

    if (!formData.time) {
      newErrors.time = 'Saat seçimi gereklidir'
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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/admin/appointments')
      } else {
        setErrors({ submit: result.error || 'Randevu oluşturulurken bir hata oluştu' })
      }
    } catch {
      setErrors({ submit: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'PENDING', label: 'Beklenen', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'CONFIRMED', label: 'Onaylanan', color: 'text-green-600 bg-green-100' },
    { value: 'CANCELLED', label: 'İptal Edilen', color: 'text-red-600 bg-red-100' },
    { value: 'COMPLETED', label: 'Sona Eren', color: 'text-blue-600 bg-blue-100' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Müşteri Adı *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Müşteri adı ve soyadı"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Customer Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Telefon Numarası *
          </label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerPhone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0532 123 45 67"
          />
          {errors.customerPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
          )}
        </div>

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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Tarih *
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={getMinDate()}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white hover:border-blue-300 ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{
                colorScheme: 'light',
                fontSize: '16px'
              }}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
          {formData.date && (
            <p className="text-green-600 text-sm mt-1">
              Seçilen tarih: {new Date(formData.date).toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Saat *
          </label>
          <select
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.time ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Saat seçiniz</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Notlar (Opsiyonel)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Randevu ile ilgili notlar..."
        />
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
              <Send className="w-5 h-5" />
              Randevu Oluştur
            </>
          )}
        </button>
      </div>
    </form>
  )
}
