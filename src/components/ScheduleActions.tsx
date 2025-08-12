'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface ScheduleActionsProps {
  scheduleId: string
  staffName: string
  dayLabel: string
}

export default function ScheduleActions({ scheduleId, staffName, dayLabel }: ScheduleActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`${staffName} - ${dayLabel} mesai saatini silmek istediğinize emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Mesai saati silinemedi')
      }
    } catch {
      alert('Bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
