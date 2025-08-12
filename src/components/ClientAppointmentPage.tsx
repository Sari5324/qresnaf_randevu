'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { User, ChevronRight, ChevronLeft, Calendar, Clock, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
}

interface SliderImage {
  id: string
  name: string
  url: string
  description?: string | null
}

interface SiteSettings {
  id: string
  companyName: string
  description?: string | null
}

interface ClientAppointmentPageProps {
  staff: Staff[]
  sliderImages: SliderImage[]
  siteSettings: SiteSettings | null
}

export default function ClientAppointmentPage({ staff, sliderImages, siteSettings }: ClientAppointmentPageProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    staffId: '',
    date: '',
    time: '',
    notes: ''
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [appointmentCode, setAppointmentCode] = useState('')
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({}) // {date: [times]}
  const [dateOffset, setDateOffset] = useState(0) // Kaç gün ileri/geri

  // Generate 6 days starting from dateOffset
  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setDate(date.getDate() + dateOffset + i)
      dates.push(date)
    }
    return dates
  }

  // Generate more flexible time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  // Load booked appointments for selected staff and date
  const loadBookedSlots = useCallback(async (staffId: string, selectedDate: string) => {
    if (!staffId || !selectedDate) return

    try {
      const response = await fetch(`/api/appointments?staffId=${staffId}&date=${selectedDate}`)
      const result = await response.json()
      
      if (response.ok && result.appointments) {
        const bookedTimes = result.appointments
          .filter((apt: any) => apt.status !== 'CANCELLED')
          .map((apt: any) => apt.time)
        
        setBookedSlots(prev => ({
          ...prev,
          [`${staffId}-${selectedDate}`]: bookedTimes
        }))
      }
    } catch (error) {
      console.error('Error loading booked slots:', error)
    }
  }, [])

  // Check if a time slot is available
  const isTimeSlotAvailable = (time: string) => {
    if (!formData.staffId || !selectedDate) return true
    const key = `${formData.staffId}-${selectedDate}`
    const bookedTimes = bookedSlots[key] || []
    return !bookedTimes.includes(time)
  }

  // Load booked slots when staff or date changes
  useEffect(() => {
    if (formData.staffId && selectedDate) {
      loadBookedSlots(formData.staffId, selectedDate)
    }
  }, [formData.staffId, selectedDate, loadBookedSlots])

  // Reset selected date when dateOffset changes
  useEffect(() => {
    setSelectedDate('')
    setSelectedTime('')
  }, [dateOffset])



  const nextImage = () => {
    if (sliderImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length)
    }
  }

  const prevImage = () => {
    if (sliderImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.staffId || !selectedDate || !selectedTime) {
      setError('Lütfen tüm zorunlu alanları doldurunuz')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          staffId: formData.staffId,
          date: selectedDate,
          time: selectedTime,
          notes: formData.notes
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setAppointmentCode(result.code)
        setShowSuccessModal(true)
        
        // Reload booked slots to reflect the new appointment
        await loadBookedSlots(formData.staffId, selectedDate)
        
        // Form verilerini temizle
        setFormData({
          customerName: '',
          customerPhone: '',
          staffId: '',
          date: '',
          time: '',
          notes: ''
        })
        setSelectedDate('')
        setSelectedTime('')
      } else {
        setError(result.error || 'Randevu oluşturulurken bir hata oluştu')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Column - Appointment Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 order-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Randevu Al</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm sm:text-base">İsim Soyisim</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm sm:text-base">Telefon Numarası</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                placeholder="0532 123 45 67"
              />
            </div>

            {/* Staff Selection */}
            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm sm:text-base">Personel</label>
              <select 
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
              >
                <option value="">Personel seçiniz</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.title && `- ${member.title}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-600 font-medium text-sm sm:text-base">Randevu Günü</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDateOffset(prev => Math.max(0, prev - 6))}
                    disabled={dateOffset === 0}
                    className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-500 px-2">
                    {dateOffset === 0 ? 'Bu hafta' : `+${Math.ceil((dateOffset + 1) / 7)} hafta`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDateOffset(prev => prev + 6)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {generateDates().map((date, i) => {
                  const dateStr = date.toISOString().split('T')[0]
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 sm:p-3 border rounded-xl transition-colors text-center text-xs sm:text-sm ${
                        selectedDate === dateStr
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-primary-50 hover:border-primary-300'
                      }`}
                    >
                      <div className="text-xs text-gray-500">
                        {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                      </div>
                      <div className="font-medium">
                        {date.getDate()}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm sm:text-base">Randevu Saati</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {timeSlots.map((time) => {
                  const isAvailable = isTimeSlotAvailable(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => isAvailable && setSelectedTime(time)}
                      disabled={!isAvailable}
                      className={`p-2 border rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                        !isAvailable
                          ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                          : selectedTime === time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-primary-50 hover:border-primary-300'
                      }`}
                    >
                      {time}
                      {!isAvailable && (
                        <span className="block text-xs opacity-75">Dolu</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-3 sm:py-4 rounded-xl transition-colors text-sm sm:text-lg"
            >
              {loading ? 'RANDEVU OLUŞTURULUYOR...' : 'RANDEVU AL'}
            </button>
          </form>
        </div>

        {/* Right Column - Staff Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Çalışmalarımız</h2>
          
          {/* Staff Image Slider */}
          <div className="relative mb-4 sm:mb-6">
            <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
              {sliderImages.length > 0 ? (
                <Image
                  src={sliderImages[currentImageIndex].url}
                  alt={sliderImages[currentImageIndex].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm sm:text-base">Çalışan Fotoğrafı</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Arrows */}
            {sliderImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 sm:p-2 shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 sm:p-2 shadow-lg transition-colors"
                >
                  <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* Staff List */}
          <div className="space-y-2 sm:space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {member.name}
                  </h3>
                  {member.title && (
                    <p className="text-blue-600 text-xs sm:text-sm">
                      {member.title}
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {member.phone}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal - Compact */}
      {showSuccessModal && (
        <>
          {/* Background Blur Overlay */}
          <div 
            className="fixed inset-0 z-40"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          ></div>
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <div className="p-6 text-center">
              {/* Success Icon */}
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">Randevu Onaylandı!</h3>
              <p className="text-sm text-gray-600 mb-4">Randevu kodunuz: <span className="font-bold text-primary-600">{appointmentCode}</span></p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appointmentCode)
                    alert('Kod kopyalandı!')
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Kopyala
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.push(`/search?code=${appointmentCode}`)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Detaylar
                </button>
              </div>
              
              {/* Close */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </main>
  )
}
