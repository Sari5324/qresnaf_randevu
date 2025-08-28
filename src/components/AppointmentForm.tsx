'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Send, Loader2, Check } from 'lucide-react'
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

  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const availableDates = getAvailableDates()

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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <User className="w-4 h-4 inline mr-1" />
          Personel Seçimi *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              onClick={() => setFormData({ ...formData, staffId: member.id })}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.staffId === member.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  {member.title && (
                    <p className="text-sm text-gray-500 mt-1">{member.title}</p>
                  )}
                </div>
                {formData.staffId === member.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.staffId && (
          <p className="text-red-500 text-sm mt-1">{errors.staffId}</p>
        )}
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Calendar className="w-4 h-4 inline mr-1" />
          Tarih Seçimi *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
          {availableDates.map((date) => {
            const dateString = date.toISOString().split('T')[0]
            const isSelected = formData.date === dateString
            const isToday = dateString === new Date().toISOString().split('T')[0]
            
            return (
              <div
                key={dateString}
                onClick={() => setFormData({ ...formData, date: dateString })}
                className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                } ${isToday ? 'ring-2 ring-orange-200' : ''}`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                </div>
                <div className="font-medium text-sm">
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('tr-TR', { month: 'short' })}
                </div>
                {isToday && (
                  <div className="text-xs text-orange-600 font-medium mt-1">Bugün</div>
                )}
              </div>
            )
          })}
        </div>
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
        )}
        {formData.date && (
          <p className="text-blue-600 text-sm mt-2 font-medium">
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Clock className="w-4 h-4 inline mr-1" />
          Saat Seçimi *
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {timeSlots.map((time) => {
            const isSelected = formData.time === time
            
            return (
              <div
                key={time}
                onClick={() => setFormData({ ...formData, time })}
                className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="text-sm">{time}</span>
                </div>
              </div>
            )
          })}
        </div>
        {errors.time && (
          <p className="text-red-500 text-sm mt-1">{errors.time}</p>
        )}
        {formData.time && (
          <p className="text-blue-600 text-sm mt-2 font-medium">
            Seçilen saat: {formData.time}
          </p>
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
