'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface AppointmentDeleteButtonProps {
  appointmentId: string
  customerName: string
  date: string
  time: string
}

export default function AppointmentDeleteButton({ 
  appointmentId, 
  customerName, 
  date, 
  time 
}: AppointmentDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`${customerName} - ${date} ${time} randevusunu silmek istediğinize emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Randevu silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error)
      alert('Randevu silinirken hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
