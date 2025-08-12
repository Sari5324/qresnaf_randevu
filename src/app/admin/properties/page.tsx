'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { Edit, Trash2, Image as ImageIcon, GripVertical, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getDisplayLocation } from '@/lib/geocoding'

interface Property {
  id: string
  title: string
  description?: string | null
  price: number
  minOfferPrice?: number | null
  location: string
  order: number
  isFeatured: boolean
  images: {
    id: string
    url: string
  }[]
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedProperty, setDraggedProperty] = useState<Property | null>(null)

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/properties')
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Drag & Drop fonksiyonları
  const handleDragStart = (e: React.DragEvent, property: Property) => {
    setDraggedProperty(property)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetProperty: Property) => {
    e.preventDefault()
    
    if (!draggedProperty || draggedProperty.id === targetProperty.id) {
      setDraggedProperty(null)
      return
    }

    const draggedIndex = properties.findIndex(p => p.id === draggedProperty.id)
    const targetIndex = properties.findIndex(p => p.id === targetProperty.id)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Yeni sıralamayı oluştur
    const newProperties = [...properties]
    const [removed] = newProperties.splice(draggedIndex, 1)
    newProperties.splice(targetIndex, 0, removed)

    // Order değerlerini güncelle
    const reorderedProperties = newProperties.map((property, index) => ({
      id: property.id,
      order: index + 1
    }))

    // State'i güncelle
    const updatedProperties = newProperties.map((property, index) => ({
      ...property,
      order: index + 1
    }))
    
    setProperties(updatedProperties)

    try {
      const response = await fetch('/api/admin/properties/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reorderedProperties }),
      })

      if (!response.ok) {
        // Hata durumunda eski sıralamaya geri dön
        fetchProperties()
      }
    } catch (error) {
      console.error('Reorder error:', error)
      // Hata durumunda eski sıralamaya geri dön
      fetchProperties()
    }

    setDraggedProperty(null)
  }

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchProperties()
      } else {
        const error = await response.json()
        alert(error.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Bağlantı hatası oluştu')
    }
  }

  const handleToggleFeatured = async (propertyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFeatured: !currentStatus
        }),
      })
      
      if (response.ok) {
        await fetchProperties()
      } else {
        const error = await response.json()
        alert(error.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Toggle featured error:', error)
      alert('Bağlantı hatası oluştu')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNav />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </main>
        <AdminFoot />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6 px-6 md:px-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">İlanlar</h1>
              <p className="mt-1 text-sm text-gray-500">
                İlanları ekleyin, düzenleyin veya silin
              </p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Yeni İlan
              </Link>
            </div>
          </div>

          {/* Properties Table */}
          <div className="px-6 md:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taşı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Konum
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr 
                      key={property.id} 
                    >
                      <td className={`px-2 py-4 whitespace-nowrap text-center hover:bg-gray-50 cursor-move ${
                        draggedProperty?.id === property.id ? 'opacity-50' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, property)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, property)}>
                        <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {property.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {property.images.length > 0 ? (
                              <Image 
                                height={40} 
                                width={40} 
                                className="h-10 w-10 rounded-lg object-cover" 
                                src={property.images[0].url} 
                                alt={property.title}
                                loading="lazy"
                                sizes="40px"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            {property.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {property.description}
                              </div>
                            )}
                            {property.isFeatured && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Öne Çıkan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        <div>
                          {property.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₺
                        </div>
                        {property.minOfferPrice && (
                          <div className="text-xs text-gray-500">
                            Min: {property.minOfferPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₺
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDisplayLocation(property.location)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleFeatured(property.id, property.isFeatured)}
                            className={`p-1 rounded transition-colors ${
                              property.isFeatured 
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title={property.isFeatured ? 'Öne çıkarılanlardan kaldır' : 'Öne çıkar'}
                          >
                            <Star className={`w-4 h-4 ${property.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-950 p-1 rounded hover:bg-red-50"
                            onClick={() => handleDelete(property.id)}
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

            {/* Empty State */}
            {properties.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  İlan bulunamadı
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  İlk ilanınızı oluşturarak başlayın.
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/properties/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Yeni İlan
                  </Link>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
