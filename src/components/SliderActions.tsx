'use client'

import { useState } from 'react'
import { Eye, EyeOff, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface SliderActionsProps {
  imageId: string
  imageName: string
  isActive: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onUpdate: () => void
}

export default function SliderActions({ 
  imageId, 
  imageName, 
  isActive, 
  canMoveUp, 
  canMoveDown, 
  onUpdate 
}: SliderActionsProps) {
  const [loading, setLoading] = useState(false)

  const toggleActive = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        onUpdate()
      } else {
        alert('Durum değiştirilemedi')
      }
    } catch {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async () => {
    if (!confirm(`"${imageName}" görselini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onUpdate()
      } else {
        const data = await response.json()
        alert('Hata: ' + (data.error || 'Görsel silinemedi'))
      }
    } catch {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const moveImage = async (direction: 'up' | 'down') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      
      if (response.ok) {
        onUpdate()
      } else {
        alert('Sıralama değiştirilemedi')
      }
    } catch {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex space-x-2">
      {/* Move Up */}
      {canMoveUp && (
        <button
          onClick={() => moveImage('up')}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          title="Yukarı taşı"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Move Down */}
      {canMoveDown && (
        <button
          onClick={() => moveImage('down')}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          title="Aşağı taşı"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Toggle Active */}
      <button
        onClick={toggleActive}
        disabled={loading}
        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
        title={isActive ? 'Pasif yap' : 'Aktif yap'}
      >
        {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Edit */}
      <Link
        href={`/admin/slider/${imageId}/edit`}
        className="text-indigo-600 hover:text-indigo-900"
        title="Düzenle"
      >
        <Edit className="w-4 h-4" />
      </Link>

      {/* Delete */}
      <button
        onClick={deleteImage}
        disabled={loading}
        className="text-red-600 hover:text-red-900 disabled:opacity-50"
        title="Sil"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
