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

export default function AppointmentSearchClient() {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-primary-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Randevu Sorgula
              </h1>
              <p className="text-sm text-gray-600">
                Randevu kodunuzla bilgilerinizi görüntüleyin
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Randevu Kodu
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              6 haneli randevu kodunuzu giriniz
            </p>
          </div>
          
          <div className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg font-mono"
                  placeholder="123456"
                  maxLength={6}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Aranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Randevu Ara
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Appointment Details */}
        {appointment && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
              <h3 className="text-lg font-bold text-white">
                Randevu Bilgileri
              </h3>
              <p className="text-green-100 text-sm mt-1">
                Kod: {appointment.code}
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Durum</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  {getStatusText(appointment.status)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hasta Adı</p>
                    <p className="text-gray-900">{appointment.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefon</p>
                    <p className="text-gray-900">{appointment.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Doktor/Personel</p>
                    <p className="text-gray-900">{appointment.staff.name}</p>
                    {appointment.staff.title && (
                      <p className="text-sm text-gray-600">{appointment.staff.title}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tarih</p>
                    <p className="text-gray-900">{formatDate(appointment.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Saat</p>
                    <p className="text-gray-900">{appointment.time}</p>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notlar</p>
                    <p className="text-gray-900">{appointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {appointment.status === 'PENDING' && (
                <button
                  onClick={cancelAppointment}
                  disabled={cancelLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 mt-6"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      İptal Ediliyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Randevuyu İptal Et
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-primary-50 border border-primary-100 rounded-lg p-4">
          <h4 className="font-semibold text-primary-800 mb-2">Bilgi</h4>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Randevu kodunuzu güvenli bir yerde saklayınız</li>
            <li>• Sadece bekleyen randevular iptal edilebilir</li>
            <li>• Onaylanan randevular için klinĭği arayınız</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
