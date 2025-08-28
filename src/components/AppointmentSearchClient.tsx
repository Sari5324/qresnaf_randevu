'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react'

interface SiteSettings {
  id: string
  companyName: string
  companyLogo: string | null
  businessNumber: string | null
  description: string | null
  themeColor: string
  themeFont: string
  darkMode: boolean
  createdAt: Date
  updatedAt: Date
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
  staff: {
    name: string
    title?: string
  }
}

export default function AppointmentSearchClient({ siteSettings }: { siteSettings: SiteSettings | null }) {
  const searchParams = useSearchParams()
  const [searchCode, setSearchCode] = useState('')
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const searchAppointment = useCallback(async (code?: string) => {
    const searchValue = code || searchCode
    if (!searchValue.trim()) {
      setError('Lütfen randevu kodunu giriniz')
      return
    }

    setLoading(true)
    setError('')
    setAppointment(null)

    try {
      const response = await fetch(`/api/appointments/search?code=${searchValue}`)
      const result = await response.json()

      if (response.ok) {
        setAppointment(result.appointment)
      } else {
        setError(result.error || 'Randevu bulunamadı')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }, [searchCode])

  // Get code from URL params and success flag
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    const successFromUrl = searchParams.get('success')
    
    if (codeFromUrl) {
      setSearchCode(codeFromUrl)
      // Automatically search if code is provided
      searchAppointment(codeFromUrl)
    }
    
    if (successFromUrl === 'true') {
      setSuccess('Randevunuz başarıyla oluşturuldu!')
    }
  }, [searchParams, searchAppointment])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchAppointment()
  }

  const cancelAppointment = async () => {
    if (!appointment) return
    
    setCancelLoading(true)
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      const result = await response.json()

      if (response.ok) {
        setAppointment({ ...appointment, status: 'CANCELLED' })
        setSuccess('Randevunuz başarıyla iptal edildi.')
      } else {
        setError(result.error || 'Randevu iptal edilirken bir hata oluştu')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setCancelLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100'
      case 'CANCELLED':
        return 'text-red-600 bg-red-100'
      case 'COMPLETED':
        return 'text-primary-600 bg-primary-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor'
      case 'CONFIRMED':
        return 'Onaylandı'
      case 'CANCELLED':
        return 'İptal Edildi'
      case 'COMPLETED':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="w-5 h-5" />
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-radial-[at_50%_0%] from-primary-300 via-primary-200 to-primary-100">
      {/* Minimal Header - Exactly like the image */}
      <header className="bg-primary-50/75 backdrop-blur-md shadow-sm border-b border-primary-100/20 bg-primary-50 sticky top-0 z-50 shadow-xl">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-block"
          >
            <ArrowLeft className="w-6 h-6 text-primary-600 hover:text-primary-700" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Search Form - Ana sayfa tasarım stili */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100/50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                Randevu Kodu
              </h2>
            </div>
            <p className="text-primary-100 text-sm">
              6 haneli randevu kodunuzu giriniz
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-xl font-mono bg-primary-50/50"
                  placeholder="123456"
                  maxLength={6}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-3 text-center bg-red-50 py-2 px-4 rounded-lg">{error}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    Randevu Ara
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Appointment Details - Ana sayfa tasarım stili */}
        {appointment && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">
                  Randevu Bilgileri
                </h3>
              </div>
              <p className="text-green-100 text-sm">
                Kod: <span className="font-mono font-bold">{appointment.code}</span>
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <span className="text-sm font-semibold text-primary-700">Durum</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  {getStatusText(appointment.status)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700">Randevu Alan</p>
                    <p className="text-primary-900 font-medium">{appointment.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700">Telefon</p>
                    <p className="text-primary-900 font-medium">{appointment.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700">Personel</p>
                    <p className="text-primary-900 font-medium">{appointment.staff.name}</p>
                    {appointment.staff.title && (
                      <p className="text-sm text-primary-600">{appointment.staff.title}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700">Tarih</p>
                    <p className="text-primary-900 font-medium">{formatDate(appointment.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700">Saat</p>
                    <p className="text-primary-900 font-medium">{appointment.time}</p>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                    <p className="text-sm font-semibold text-primary-700 mb-2">Notlar</p>
                    <p className="text-primary-900">{appointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {appointment.status === 'PENDING' && (
                <button
                  onClick={cancelAppointment}
                  disabled={cancelLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-6"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      İptal Ediliyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-6 h-6" />
                      Randevuyu İptal Et
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}        {/* Info - Ana sayfa tasarım stili */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary-600" />
            </div>
            <h4 className="font-bold text-primary-800 text-lg">Önemli Bilgiler</h4>
          </div>
          <ul className="text-sm text-primary-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></span>
              Randevu kodunuzu güvenli bir yerde saklayınız.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></span>
              Sadece bekleyen randevular iptal edilebilir.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></span>
              Onaylanan randevular için iş yerini arayınız.
            </li>
          </ul>
          {siteSettings?.businessNumber && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Phone className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-700">İş Yeri Numarası</p>
                  <p className="text-primary-900 font-mono font-bold">{siteSettings.businessNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
