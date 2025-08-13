'use client'

import { useState } from 'react'
import { Images, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SliderImageWithFallback from './SliderImageWithFallback'

interface SliderImage {
  id: string
  name: string
  url: string
  description: string | null
  isActive: boolean
  order: number
}

interface SliderClientPageProps {
  sliderImages: SliderImage[]
  totalImages: number
  activeImages: number
}

export default function SliderClientPage({ 
  sliderImages, 
  totalImages, 
  activeImages 
}: SliderClientPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const refreshPage = () => {
    router.refresh()
  }

  const toggleActive = async (imageId: string, currentActive: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      })
      
      if (response.ok) {
        refreshPage()
      } else {
        alert('Durum değiştirilemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (imageId: string, imageName: string) => {
    if (!confirm(`"${imageName}" görselini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        refreshPage()
      } else {
        const data = await response.json()
        alert('Hata: ' + (data.error || 'Görsel silinemedi'))
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const moveImage = async (imageId: string, direction: 'up' | 'down') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/slider/${imageId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      
      if (response.ok) {
        refreshPage()
      } else {
        alert('Sıralama değiştirilemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Images className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Görsel</p>
              <p className="text-2xl font-bold text-gray-900">{totalImages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Görsel</p>
              <p className="text-2xl font-bold text-gray-900">{activeImages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Images Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Görsel Listesi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Görsel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sliderImages.map((image, index) => (
                <tr key={image.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{image.order}</span>
                      <div className="flex flex-col space-y-1">
                        {index > 0 && (
                          <button
                            onClick={() => moveImage(image.id, 'up')}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Yukarı taşı"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {index < sliderImages.length - 1 && (
                          <button
                            onClick={() => moveImage(image.id, 'down')}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Aşağı taşı"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-24 relative bg-gray-100 rounded">
                      <SliderImageWithFallback
                        src={image.url}
                        alt={image.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{image.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {image.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      image.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {image.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleActive(image.id, image.isActive)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title={image.isActive ? 'Pasif yap' : 'Aktif yap'}
                      >
                        {image.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <Link
                        href={`/admin/slider/${image.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteImage(image.id, image.name)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sliderImages.length === 0 && (
          <div className="text-center py-12">
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz görsel yok</h3>
            <p className="text-gray-500">İlk görseli eklemek için yukarıdaki "Yeni Görsel Ekle" butonuna tıklayın.</p>
          </div>
        )}
      </div>
    </>
  )
}
