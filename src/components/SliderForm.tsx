'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Images, Upload, Save, ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

interface SliderFormProps {
  initialData?: {
    id?: string
    name: string
    url: string
    description?: string | null
    order: number
    isActive: boolean
  }
}

export default function SliderForm({ initialData }: SliderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [nextOrder, setNextOrder] = useState<number>(1)
  
  // Get next available order on mount
  useEffect(() => {
    const fetchNextOrder = async () => {
      try {
        const response = await fetch('/api/admin/slider/next-order')
        if (response.ok) {
          const data = await response.json()
          setNextOrder(data.nextOrder)
        }
      } catch (error) {
        console.error('Order fetch error:', error)
      }
    }
    
    if (!initialData) {
      fetchNextOrder()
    }
  }, [initialData])

  // Update order when nextOrder changes
  useEffect(() => {
    if (!initialData && nextOrder > 1) {
      setFormData(prev => ({
        ...prev,
        order: nextOrder
      }))
    }
  }, [nextOrder, initialData])
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileSelect = async (file: File | File[] | null) => {
    if (!file) return
    
    const singleFile = Array.isArray(file) ? file[0] : file
    if (!singleFile) return

    // Validate file type
    if (!singleFile.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin')
      return
    }

    // Validate file size (max 5MB)
    if (singleFile.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', singleFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, url: result.url }))
      } else {
        const error = await response.json()
        setError(error.error || 'Dosya yükleme başarısız')
      }
    } catch {
      setError('Dosya yükleme sırasında hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.name.trim()) {
        setError('Görsel adı gereklidir')
        setLoading(false)
        return
      }

      if (!formData.url.trim()) {
        setError('Görsel URL\'si gereklidir')
        setLoading(false)
        return
      }

      const url = initialData?.id ? `/api/admin/slider/${initialData.id}` : '/api/admin/slider'
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order.toString())
        })
      })

      if (response.ok) {
        router.push('/admin/slider')
      } else {
        const data = await response.json()
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ')
          setError(errorMessages)
        } else {
          setError(data.error || 'Bir hata oluştu')
        }
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Info */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Images className="w-5 h-5 mr-2" />
            Görsel Bilgileri
          </h3>
          <Link
            href="/admin/slider"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Geri
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Görsel Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Berber Hizmetleri"
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Gösterim Sırası *
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Aktif (Slider&apos;da göster)
            </label>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Görsel hakkında kısa açıklama..."
            />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Görsel Yükleme
        </h3>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <FileUpload
              label="Görsel Dosyası"
              accept="image/*"
              currentImage={formData.url}
              onFileSelect={handleFileSelect}
              error={uploading ? 'Dosya yükleniyor...' : undefined}
              className="w-full"
            />
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Görsel URL *
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="/uploads/image.jpg veya https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Dosya yüklediyseniz otomatik dolar, veya direkt URL girebilirsiniz
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Kaydediliyor...' : initialData?.id ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
