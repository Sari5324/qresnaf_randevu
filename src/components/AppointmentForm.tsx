'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string
  title?: string | null
}

interface AppointmentFormProps {
  staff: Staff[]
}

export default function AppointmentForm({ staff }: AppointmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    staffId: '',
    date: '',
    time: '',
    notes: ''
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
      newErrors.customerName = 'Ad Soyad gereklidir'
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefon numarası gereklidir'
    } else if (!/^(\+90|0)?[5][0-9]{9}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Geçerli bir telefon numarası giriniz'
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
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

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
        // Redirect to search page with appointment code
        router.push(`/search?code=${result.code}&success=true`)
      } else {
        setErrors({ submit: result.error || 'Randevu oluşturulurken bir hata oluştu' })
      }
    } catch {
      setErrors({ submit: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Ad Soyad *
        </label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerName ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Adınız ve soyadınız"
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

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Tarih *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={getMinDate()}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.date ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
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

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notlar (Opsiyonel)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Randevunuzla ilgili özel notlarınız"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Randevu Oluşturuluyor...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Randevu Al
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        * ile işaretli alanlar zorunludur
      </p>
    </form>
  )
}
