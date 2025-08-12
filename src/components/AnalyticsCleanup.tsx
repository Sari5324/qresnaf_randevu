'use client'

import { useState } from 'react'

export default function AnalyticsCleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCleanup = async () => {
    if (!confirm('30 günden eski randevu analiz verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/analytics/cleanup', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`${data.deletedCount} eski kayıt temizlendi`)
        // Reload page after 5 seconds to update stats
        setTimeout(() => {
          window.location.reload()
        }, 5000)
      } else {
        setMessage(`Hata: ${data.error}`)
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu')
      console.error('Analytics cleanup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-right">
      {message && (
        <div className="mt-2 text-sm text-gray-600">{message}</div>
      )}
      <button
        onClick={handleCleanup}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 bg-blue-900 rounded-md shadow-sm font-medium text-white hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        title="30 günden eski verileri temizle"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Temizleniyor...
          </>
        ) : (
          <>
            Eski Verileri Temizle
          </>
        )}
      </button>
    </div>
  )
}
