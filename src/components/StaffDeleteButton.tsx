'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface StaffDeleteButtonProps {
  staffId: string
  staffName: string
}

export default function StaffDeleteButton({ 
  staffId, 
  staffName 
}: StaffDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`${staffName} personelini silmek istediğinize emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Personel silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Failed to delete staff:', error)
      alert('Personel silinirken hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4 mr-1" />
      {isDeleting ? 'Siliniyor...' : 'Sil'}
    </button>
  )
}
