'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import FileUpload from './FileUpload'

interface Property {
  id: string
  title: string
  description?: string | null
  price: number
  minOfferPrice?: number | null
  location: string
  images: { id: string; url: string; order: number }[]
  tags?: { id: string; name: string }[] | string
  isFeatured: boolean
  order: number
  video?: string | null
}

interface PropertyFormProps {
  readonly property?: Property
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || 0,
    minOfferPrice: property?.minOfferPrice || 0,
    location: property?.location || '',
    video: property?.video || '',
    isFeatured: property?.isFeatured || false,
    order: property?.order || 1
  })
  const [tags, setTags] = useState<string[]>(() => {
    if (!property?.tags) return []
    if (typeof property.tags === 'string') {
      try {
        return JSON.parse(property.tags)
      } catch {
        return []
      }
    }
    if (Array.isArray(property.tags)) {
      return property.tags.map((tag: any) => tag.name)
    }
    return []
  })
  const [currentTag, setCurrentTag] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleFileSelect = (files: File[] | File | null) => {
    if (files === null) {
      setSelectedFile(null)
      setSelectedFiles([])
    } else if (Array.isArray(files)) {
      setSelectedFiles(files)
      setSelectedFile(null)
    } else {
      setSelectedFile(files)
      setSelectedFiles([])
    }
  }

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToRemove(prev => [...prev, imageId])
  }

  const handleRestoreImage = (imageId: string) => {
    setImagesToRemove(prev => prev.filter(id => id !== imageId))
  }

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Dosya yükleme hatası')
    }

    const data = await response.json()
    return data.url
  }

  useEffect(() => {
    // For new properties, get the next order number
    if (!property) {
      fetchNextOrder()
    }
  }, [property])

  const fetchNextOrder = async () => {
    try {
      const response = await fetch('/api/admin/properties/next-order')
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, order: data.nextOrder }))
      }
    } catch (error) {
      console.error('Sonraki sıra numarası alınamadı:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    let processedValue: string | number | boolean = value
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked
    } else if (name === 'price' || name === 'minOfferPrice') {
      processedValue = parseFloat(value) || 0
    } else if (name === 'order') {
      processedValue = parseInt(value) || 1
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'İlan başlığı gereklidir'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Konum gereklidir'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Fiyat 0\'dan büyük olmalıdır'
    }
    if (formData.order <= 0) {
      newErrors.order = 'Sıra 0\'dan büyük olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      let imageUrls: string[] = []

      // Upload new files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadFile(file)
          imageUrls.push(url)
        }
      } else if (selectedFile) {
        const url = await uploadFile(selectedFile)
        imageUrls.push(url)
      }

      const url = property ? `/api/admin/properties/${property.id}` : '/api/admin/properties'
      const method = property ? 'PUT' : 'POST'

      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: formData.price,
        minOfferPrice: formData.minOfferPrice || null,
        location: formData.location.trim(),
        video: formData.video.trim() || null,
        isFeatured: formData.isFeatured,
        order: formData.order,
        tags: tags,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        imagesToRemove: imagesToRemove.length > 0 ? imagesToRemove : undefined
      }

      console.log('Sending request data:', requestData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        router.push('/admin/properties')
      } else {
        const errorData = await response.json()
        setErrors(errorData.errors || { general: 'Bir hata oluştu' })
      }
    } catch (error) {
      console.error('Property form error:', error)
      setErrors({ general: 'Bağlantı hatası oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {property ? 'İlan Düzenle' : 'Yeni İlan'}
          </h2>
          <Link
            href="/admin/properties"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-4 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* İlan Başlığı */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            İlan Başlığı *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="İlan başlığını girin"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Konum */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Konum *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Konum bilgisini girin"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Fiyat ve Minimum Teklif Fiyatı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat (₺) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="minOfferPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Teklif Fiyatı (₺)
            </label>
            <input
              type="number"
              id="minOfferPrice"
              name="minOfferPrice"
              value={formData.minOfferPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
            {errors.minOfferPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.minOfferPrice}</p>
            )}
          </div>
        </div>

        {/* Gösterim Sırası ve Öne Çıkarılmış */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="block w-20 px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">{errors.order}</p>
            )}
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
              İlanı öne çıkar
            </label>
          </div>
        </div>

        {/* Video */}
        <div>
          <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
            Video (YouTube Linki)
          </label>
          <input
            type="url"
            id="video"
            name="video"
            value={formData.video}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="https://youtube.com/watch?v=..."
          />
          {errors.video && (
            <p className="mt-1 text-sm text-red-600">{errors.video}</p>
          )}
        </div>

        {/* Etiketler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiketler
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Etiket ekle..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Görseller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlan Görseli
          </label>
          <FileUpload
            label="İlan Görselleri (Birden fazla seçebilirsiniz)"
            onFileSelect={handleFileSelect}
            error={errors.image}
            multiple={true}
          />
          {property?.images && property.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Mevcut görseller:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {property.images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt="Property"
                      className={`w-full h-24 object-cover rounded-md transition-opacity ${
                        imagesToRemove.includes(image.id) ? 'opacity-50' : ''
                      }`}
                    />
                    {imagesToRemove.includes(image.id) ? (
                      <button
                        type="button"
                        onClick={() => handleRestoreImage(image.id)}
                        className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 text-xs hover:bg-green-600 transition-colors"
                        title="Geri ekle"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                        title="Kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {imagesToRemove.includes(image.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Kaldırılacak
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Yeni eklenen dosyaların önizlemesi */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Yeni eklenecek görseller:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New file ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                      title="Kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            İlan Açıklaması
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="İlan açıklamasını girin"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Yükleniyor...
            </>
          ) : (
            <>
              {property ? 'Güncelle' : 'Oluştur'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
