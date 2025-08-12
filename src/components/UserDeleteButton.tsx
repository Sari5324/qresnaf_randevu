'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface UserDeleteButtonProps {
  userId: string
  username: string
  currentUserEmail: string
  userEmail: string
}

export default function UserDeleteButton({ 
  userId, 
  username, 
  currentUserEmail, 
  userEmail 
}: UserDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  console.log('UserDeleteButton render:', { userId, username, currentUserEmail, userEmail })

  const handleDelete = async () => {
    alert('Delete button clicked!') // Test alert
    console.log('Delete button clicked for user:', userId, username)
    
    if (!confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsDeleting(true)
    try {
      console.log('Sending DELETE request to:', `/api/admin/users/${userId}`)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        console.log('Delete successful, reloading page')
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.log('Delete error:', errorData)
        alert(errorData.error || 'Kullanıcı silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Kullanıcı silinirken hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  // Don't show delete button for current user
  if (currentUserEmail === userEmail) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        Sizsiniz
      </span>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-950 p-1 rounded disabled:opacity-50 border border-red-200"
      title={`Sil - ${userId}`}
      style={{ minWidth: '32px', minHeight: '32px' }}
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting && <span className="text-xs">...</span>}
    </button>
  )
}
