'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface AppointmentCompleteButtonProps {
  appointmentId: string
  customerName: string
  date: string
  time: string
  onComplete?: () => void
}

export default function AppointmentCompleteButton({ 
  appointmentId, 
  customerName, 
  date, 
  time,
  onComplete
}: AppointmentCompleteButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    if (!confirm(`${customerName} - ${date} ${time} randevusunu tamamlandı olarak işaretlemek istediğinize emin misiniz?`)) {
      return
    }

    setIsCompleting(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        })
      })

      if (response.ok) {
        if (onComplete) {
          onComplete()
        } else {
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Randevu güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Failed to complete appointment:', error)
      alert('Randevu güncellenirken hata oluştu')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <button 
      onClick={handleComplete}
      disabled={isCompleting}
      className="text-white p-1 rounded disabled:opacity-50 bg-green-500 hover:bg-green-600"
      title="Randevuyu Tamamla"
    >
      <CheckCircle className="w-4 h-4" />
    </button>
  )
}
