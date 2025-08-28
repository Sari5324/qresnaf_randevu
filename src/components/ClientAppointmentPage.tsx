'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { User, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
  workSchedule?: WorkSchedule[]
}

interface WorkSchedule {
  id: string
  dayOfWeek: string
  isWorking: boolean
  startTime?: string | null
  endTime?: string | null
  breakStart?: string | null
  breakEnd?: string | null
  interval?: number | null
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

export default function ClientAppointmentPage({ staff, sliderImages }: ClientAppointmentPageProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPlaying] = useState(true)
  const [showSliderModal, setShowSliderModal] = useState(false)
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
  const [isCopied, setIsCopied] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({}) // {date: [times]}
  const [dateOffset, setDateOffset] = useState(0) // Kaç gün ileri/geri
  const [staffSchedule, setStaffSchedule] = useState<WorkSchedule[]>([]) // Seçili personelin çalışma programı

  // Get date range text for current period
  const getDateRangeText = () => {
    const dates = generateDates()
    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]
    
    const firstMonth = firstDate.toLocaleDateString('tr-TR', { month: 'short' })
    const lastMonth = lastDate.toLocaleDateString('tr-TR', { month: 'short' })
    const year = firstDate.getFullYear()
    
    if (firstMonth === lastMonth) {
      // Same month
      return `${firstDate.getDate()}-${lastDate.getDate()} ${firstMonth} ${year}`
    } else {
      // Different months
      return `${firstDate.getDate()} ${firstMonth} - ${lastDate.getDate()} ${lastMonth} ${year}`
    }
  }

  // Generate 7 days starting from dateOffset
  const generateDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today) // Her iterasyonda bugünün kopyasından başla
      date.setDate(today.getDate() + dateOffset + i)
      dates.push(date)
    }
    return dates
  }

  // Load staff work schedule
  const loadStaffSchedule = useCallback(async (staffId: string) => {
    if (!staffId) {
      setStaffSchedule([])
      return
    }

    // Find staff from the existing staff list since it already includes workSchedule
    const selectedStaff = staff.find(member => member.id === staffId)
    
    if (selectedStaff?.workSchedule) {
      setStaffSchedule(selectedStaff.workSchedule)
    } else {
      setStaffSchedule([])
    }
  }, [staff])

  // Generate time slots based on staff schedule for a specific date
  const getAvailableTimeSlotsForDate = (date: Date) => {
    if (!formData.staffId || staffSchedule.length === 0) {
      return [] // Return empty array if no staff selected or no schedule
    }

    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
    const daySchedule = staffSchedule.find(schedule => schedule.dayOfWeek === dayOfWeek)
    
    if (!daySchedule || !daySchedule.isWorking) {
      return [] // No work on this day
    }

    // Generate time slots based on staff's work hours
    const startTime = daySchedule.startTime || '09:00'
    const endTime = daySchedule.endTime || '17:00'
    const interval = daySchedule.interval || 30
    const breakStart = daySchedule.breakStart
    const breakEnd = daySchedule.breakEnd

    const slots = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    let currentTime = startHour * 60 + startMin // Convert to minutes
    const endTimeMinutes = endHour * 60 + endMin
    
    while (currentTime < endTimeMinutes) {
      const hours = Math.floor(currentTime / 60)
      const minutes = currentTime % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      
      // Check if this time is during break
      let isDuringBreak = false
      if (breakStart && breakEnd) {
        const [breakStartHour, breakStartMin] = breakStart.split(':').map(Number)
        const [breakEndHour, breakEndMin] = breakEnd.split(':').map(Number)
        const breakStartMinutes = breakStartHour * 60 + breakStartMin
        const breakEndMinutes = breakEndHour * 60 + breakEndMin
        
        if (currentTime >= breakStartMinutes && currentTime < breakEndMinutes) {
          isDuringBreak = true
        }
      }
      
      if (!isDuringBreak) {
        slots.push(timeString)
      }
      
      currentTime += interval
    }
    
    return slots
  }

  // Check if a date is available (staff works on this day)
  const isDateAvailable = (date: Date) => {
    // Eğer personel seçilmemişse false döndür (gün seçilemesin)
    if (!formData.staffId) {
      return false
    }

    // Eğer personel seçili ama çalışma programı yoksa false döndür
    if (staffSchedule.length === 0) {
      return false
    }

    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
    const daySchedule = staffSchedule.find(schedule => schedule.dayOfWeek === dayOfWeek)
    
    return daySchedule && daySchedule.isWorking
  }

  // Load booked appointments for selected staff and date
  const loadBookedSlots = useCallback(async (staffId: string, selectedDate: string) => {
    if (!staffId || !selectedDate) return

    try {
      const response = await fetch(`/api/appointments?staffId=${staffId}&date=${selectedDate}`)
      const result = await response.json()
      
      if (response.ok && result.appointments) {
        const bookedTimes = result.appointments
          .filter((apt: { status: string }) => apt.status !== 'CANCELLED')
          .map((apt: { time: string }) => apt.time)
        
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

  // Load staff schedule when staff changes
  useEffect(() => {
    if (formData.staffId) {
      loadStaffSchedule(formData.staffId)
    } else {
      setStaffSchedule([])
    }
    // Reset date and time when staff changes
    setSelectedDate('')
    setSelectedTime('')
  }, [formData.staffId, loadStaffSchedule])

  // Reset selected date when dateOffset changes
  useEffect(() => {
    setSelectedDate('')
    setSelectedTime('')
  }, [dateOffset])

  // Auto-play slider
  useEffect(() => {
    if (!isPlaying || sliderImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isPlaying, sliderImages.length])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
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
    <main className="mx-auto px-4 py-3 sm:py-3" style={{ maxWidth: '416px' }}>
      <div className="space-y-6">
        
        {/* Appointment Form */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Randevu Al</h2>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
              <label className="block text-gray-600 font-medium mb-3 text-sm sm:text-base">Personel Seçimi</label>
              <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="grid grid-cols-1 gap-2">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setFormData({ ...formData, staffId: member.id })}
                      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        formData.staffId === member.id
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            formData.staffId === member.id ? 'bg-primary-500' : 'bg-gray-400'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{member.name}</h3>
                            {member.title && (
                              <p className="text-xs text-gray-500">{member.title}</p>
                            )}
                          </div>
                        </div>
                        {formData.staffId === member.id && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Staff Schedule Info */}
              {formData.staffId && staffSchedule.length > 0 && (
                <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <h4 className="text-sm font-medium text-primary-700 mb-2">Çalışma Saatleri</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {staffSchedule
                      .filter(schedule => schedule.isWorking) // Sadece çalışma günlerini göster
                      .sort((a, b) => {
                        // Gün sıralaması: Pazartesi'den Pazar'a
                        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
                        return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
                      })
                      .map((schedule) => {
                        const dayNames = {
                          MONDAY: 'Pazartesi',
                          TUESDAY: 'Salı', 
                          WEDNESDAY: 'Çarşamba',
                          THURSDAY: 'Perşembe',
                          FRIDAY: 'Cuma',
                          SATURDAY: 'Cumartesi',
                          SUNDAY: 'Pazar'
                        }
                        
                        return (
                          <div key={schedule.dayOfWeek} className="flex justify-between items-center">
                            <span className="text-primary-700">{dayNames[schedule.dayOfWeek as keyof typeof dayNames]}</span>
                            <div className="text-right">
                              <div className="font-medium text-primary-700">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className="text-xs text-primary-500">
                                Randevu: {schedule.interval === 60 ? '1 saat' : '30 dk'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-600 font-medium text-sm sm:text-base">Randevu Günü</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDateOffset(prev => Math.max(0, prev - 6))}
                    disabled={dateOffset === 0}
                    className="p-2 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                    {getDateRangeText()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDateOffset(prev => prev + 6)}
                    className="p-2 rounded-lg hover:bg-primary-50 transition-colors border border-gray-200"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateDates().map((date, i) => {
                  // Local tarih formatı kullan (UTC timezone sorunu önlemek için)
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  const dateStr = `${year}-${month}-${day}`
                  
                  const today = new Date()
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                  const isToday = dateStr === todayStr
                  const isAvailable = isDateAvailable(date)
                  
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => isAvailable && setSelectedDate(dateStr)}
                      disabled={!isAvailable}
                      className={`p-2 border-2 rounded-xl transition-all duration-200 text-center hover:shadow-sm ${
                        !isAvailable
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                          : selectedDate === dateStr
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                          : 'border-gray-200 hover:bg-primary-50 hover:border-primary-300'
                      } ${isToday && isAvailable ? 'ring-2 ring-orange-200' : ''}`}
                    >
                      <div className={`text-xs mb-1 ${
                        !isAvailable 
                          ? 'text-gray-400' 
                          : selectedDate === dateStr 
                          ? 'text-primary-100' 
                          : 'text-gray-500'
                      }`}>
                        {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                      </div>
                      <div className="font-bold text-sm">
                        {date.getDate()}
                      </div>
                      <div className={`text-xs ${
                        !isAvailable 
                          ? 'text-gray-400' 
                          : selectedDate === dateStr 
                          ? 'text-primary-100' 
                          : 'text-gray-500'
                      }`}>
                        {date.toLocaleDateString('tr-TR', { month: 'short' })}
                      </div>
                      {!isAvailable && (
                        <div className="text-xs text-gray-400 font-bold mt-1">✕</div>
                      )}
                      {isToday && isAvailable && (
                        <div className="text-xs text-orange-600 font-medium mt-1">Bugün</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-gray-600 font-medium mb-3 text-sm sm:text-base">Randevu Saati</label>
              {!selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">Önce tarih seçiniz</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {(() => {
                    const selectedDateObj = new Date(selectedDate)
                    const availableSlots = getAvailableTimeSlotsForDate(selectedDateObj)
                    
                    if (availableSlots.length === 0) {
                      return (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-10.293a1 1 0 00-1.414-1.414L9 14.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l9-9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm">Bu tarihte çalışma saati bulunmamaktadır</p>
                        </div>
                      )
                    }
                    
                    return availableSlots.map((time) => {
                      const isBooked = !isTimeSlotAvailable(time)
                      const isAvailable = !isBooked
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => isAvailable && setSelectedTime(time)}
                          disabled={!isAvailable}
                          className={`p-3 border-2 rounded-xl transition-all duration-200 text-center hover:shadow-sm ${
                            !isAvailable
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : selectedTime === time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                              : 'border-gray-200 hover:bg-primary-50 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{time}</span>
                          </div>
                          {!isAvailable && (
                            <div className="text-xs opacity-75 mt-1">Dolu</div>
                          )}
                        </button>
                      )
                    })
                  })()}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

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

        {/* Staff Section */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Çalışmalarımız</h2>
          
          {/* Modern Slider Preview */}
          <div className="mb-3 sm:mb-4">
            {sliderImages.length > 0 ? (
              <div 
                onClick={() => setShowSliderModal(true)}
                className="relative w-full group cursor-pointer"
                style={{ aspectRatio: '9/16' }}
              >
                {/* Main Image Container */}
                <div className="relative w-full h-full overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                  
                  {/* Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={sliderImages[currentImageIndex].url}
                      alt={sliderImages[currentImageIndex].name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      priority={currentImageIndex === 0}
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Click to View Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Görüntülemek için tıklayın</p>
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
                    <div className="text-white">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 drop-shadow-lg">
                        {sliderImages[currentImageIndex].name}
                      </h3>
                      {sliderImages[currentImageIndex].description && (
                        <p className="text-sm sm:text-base text-white/90 drop-shadow-lg">
                          {sliderImages[currentImageIndex].description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Count Indicator */}
                  {sliderImages.length > 1 && (
                    <div className="absolute top-4 right-4 z-30">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        {currentImageIndex + 1} / {sliderImages.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-full h-48 sm:h-60 lg:h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">Henüz görsel eklenmemiş</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slider Modal - 9:16 Format */}
      {showSliderModal && (
        <>
          {/* Background Blur Overlay */}
          <div 
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowSliderModal(false)}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm mx-auto">
              {/* 9:16 Image Container */}
              <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                  {/* Close Button - Inside Image */}
                  <button
                    onClick={() => setShowSliderModal(false)}
                    className="absolute top-4 right-4 z-60 bg-white/90 hover:bg-white text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Image */}
                  <Image
                    src={sliderImages[currentImageIndex].url}
                    alt={sliderImages[currentImageIndex].name}
                    fill
                    sizes="(max-width: 768px) 90vw, 400px"
                    className="object-cover"
                    priority
                  />

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="text-white">
                      <h3 className="text-lg font-bold mb-2">
                        {sliderImages[currentImageIndex].name}
                      </h3>
                      {sliderImages[currentImageIndex].description && (
                        <p className="text-sm text-white/90">
                          {sliderImages[currentImageIndex].description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {sliderImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevImage()
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-60 bg-white/30 hover:bg-white/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextImage()
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-60 bg-white/30 hover:bg-white/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {sliderImages.length > 1 && (
                    <div className="absolute top-4 left-4 z-60">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {sliderImages.length}
                      </div>
                    </div>
                  )}

                  {/* Dots Indicator */}
                  {sliderImages.length > 1 && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-60">
                      <div className="flex space-x-2">
                        {sliderImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? 'bg-white scale-125'
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
                    if (!isCopied) {
                      navigator.clipboard.writeText(appointmentCode)
                      setIsCopied(true)
                    }
                  }}
                  disabled={isCopied}
                  className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors text-sm ${
                    isCopied 
                      ? 'text-green-600 cursor-default' 
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isCopied ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-sm">✓</span>
                      Kopyalandı
                    </span>
                  ) : (
                    'Kopyala'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    setIsCopied(false)
                    router.push(`/search?code=${appointmentCode}`)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Detaylar
                </button>
              </div>
              
              {/* Close */}
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setIsCopied(false)
                }}
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
