'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Tag, X, Armchair, Bath, BedDouble, BedSingle, Bed, Bike, Box, BriefcaseBusiness, Building2, Bus, BusFront, Car, CarFront, Cigarette, CigaretteOff, DoorClosed, DoorOpen, GraduationCap, Landmark, MapPin, Leaf, Maximize, Mountain, MountainSnow, Plane, School, Ruler, RadioTower, Scaling, ShoppingBasket, Sofa, Store, Truck, Tractor, TrainFront, University, Warehouse, Toilet, Sun, Hotel, House, Fuel, Gauge, RulerDimensionLine } from 'lucide-react'
import Link from 'next/link'
import FileUpload from './FileUpload'
import { getDisplayLocation } from '../lib/geocoding'

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
  const [tags, setTags] = useState<Array<{name: string, icon?: string}>>(() => {
    if (!property?.tags) return []
    if (typeof property.tags === 'string') {
      try {
        return JSON.parse(property.tags)
      } catch {
        return []
      }
    }
    if (Array.isArray(property.tags)) {
      return property.tags.map((tag: any) => ({ name: tag.name, icon: tag.icon }))
    }
    return []
  })
  const [currentTag, setCurrentTag] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [coordinates, setCoordinates] = useState(() => {
    // Eğer düzenleme modundaysa ve property'de location varsa o koordinatları kullan
    if (property?.location) {
      const locationMatch = property.location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
      if (locationMatch) {
        return {
          lat: parseFloat(locationMatch[1]),
          lng: parseFloat(locationMatch[2])
        }
      }
    }
    // Varsayılan İstanbul koordinatları
    return { lat: 41.0082, lng: 28.9784 }
  })
  const [isDragging, setIsDragging] = useState(false) // Sürükleme durumu
  const [mapKey, setMapKey] = useState(0) // Iframe yeniden yükleme kontrolü
  const [currentZoom, setCurrentZoom] = useState(16) // Mevcut zoom seviyesi
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Available icons for tags
  const availableIcons: { [key: string]: any } = {
    'ArmChair': Armchair,
    'Bath': Bath,
    'BedDouble': BedDouble,
    'BedSingle': BedSingle,
    'Bed': Bed,
    'Bike': Bike,
    'Box': Box,
    'BriefcaseBusiness': BriefcaseBusiness,
    'Building2': Building2,
    'Bus': Bus,
    'BusFront': BusFront,
    'Car': Car,
    'CarFront': CarFront,
    'Cigarette': Cigarette,
    'CigaretteOff': CigaretteOff,
    'DoorClosed': DoorClosed,
    'DoorOpen': DoorOpen,
    'GraduationCap': GraduationCap,
    'Landmark': Landmark,
    'MapPin': MapPin,
    'Leaf': Leaf,
    'Maximize': Maximize,
    'Mountain': Mountain,
    'MountainSnow': MountainSnow,
    'Plane': Plane,
    'School': School,
    'Ruler': Ruler,
    'RadioTower': RadioTower,
    'Scaling': Scaling,
    'ShoppingBasket': ShoppingBasket,
    'Sofa': Sofa,
    'Store': Store,
    'Truck': Truck,
    'Tractor': Tractor,
    'TrainFront': TrainFront,
    'University': University,
    'Warehouse': Warehouse,
    'Toilet': Toilet,
    'Sun': Sun,
    'Hotel': Hotel,
    'House': House,
    'Fuel': Fuel,
    'Gauge': Gauge,
    'RulerDimensionLine': RulerDimensionLine
  }

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

  // Iframe yenileme kontrolü - sadece sürükleme bittiğinde yenile
  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => {
        setMapKey(prev => prev + 1)
      }, 100) // 100ms gecikme ile iframe'i yenile
      
      return () => clearTimeout(timer)
    }
  }, [isDragging])

  // Zoom değiştiğinde iframe'i yenile
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [currentZoom])

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
    if (currentTag.trim() && !tags.some(tag => tag.name === currentTag.trim())) {
      setTags([...tags, { name: currentTag.trim(), icon: selectedIcon || undefined }])
      setCurrentTag('')
      setSelectedIcon('')
    }
  }

  const removeTag = (tagToRemove: {name: string, icon?: string}) => {
    setTags(tags.filter(tag => tag.name !== tagToRemove.name))
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konum *
          </label>
          
          {/* Seçilen Konum Gösterimi */}
          {formData.location && (
            <div className="mb-3 p-3 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">Seçilen Konum: {getDisplayLocation(formData.location)}</span>
              </div>
            </div>
          )}
          
          {/* Harita Seçici */}
          <div>
            <button
              type="button"
              onClick={() => setShowMapPicker(!showMapPicker)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors w-full justify-center ${
                formData.location 
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showMapPicker ? 'Haritayı Kapat' : formData.location ? 'Konum Düzenle' : 'Konum Belirle'}
            </button>
            
            {showMapPicker && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {/* Gerçek zamanlı iframe - zoom seviyesi dahil */}
                  <iframe
                    key={mapKey}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01/Math.pow(2,currentZoom-16)},${coordinates.lat-0.01/Math.pow(2,currentZoom-16)},${coordinates.lng+0.01/Math.pow(2,currentZoom-16)},${coordinates.lat+0.01/Math.pow(2,currentZoom-16)}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`}
                    title="Konum Seçici"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                  
                  {/* Sürüklenebilir harita overlay - tüm alanı kaplar */}
                  <div 
                    className="absolute inset-0 cursor-move"
                    style={{ 
                      touchAction: 'pan-x pan-y'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                      
                      // Sürükleme başlangıç değerleri
                      const startX = e.clientX
                      const startY = e.clientY
                      const startLat = coordinates.lat
                      const startLng = coordinates.lng
                      
                      // Harita boyutları
                      const mapContainer = e.currentTarget.parentElement
                      const mapRect = mapContainer!.getBoundingClientRect()
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        // Mouse hareketini hesapla
                        const deltaX = moveEvent.clientX - startX
                        const deltaY = moveEvent.clientY - startY
                        
                        // Dinamik zoom seviyesi ile hesaplama
                        // Bbox genişliği zoom seviyesine göre değişir
                        const bboxSize = 0.02 / Math.pow(2, currentZoom - 16) // zoom 16'ya göre normalize
                        
                        // Basit koordinat dönüşümü (zoom seviyesine adaptif)
                        const lngPerPixel = bboxSize / mapRect.width
                        const latPerPixel = bboxSize / mapRect.height
                        
                        // Yeni koordinatlar (zoom seviyesine göre ayarlanmış)
                        const newLng = startLng - (deltaX * lngPerPixel)
                        const newLat = startLat + (deltaY * latPerPixel)
                        
                        // State'i güncelle
                        setCoordinates({ lat: newLat, lng: newLng })
                        const locationText = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`
                        setFormData(prev => ({ ...prev, location: locationText }))
                      }
                      
                      const handleMouseUp = () => {
                        setIsDragging(false) // iframe'i yenileyecek
                        document.removeEventListener('mousemove', handleMouseMove)
                        document.removeEventListener('mouseup', handleMouseUp)
                      }
                      
                      document.addEventListener('mousemove', handleMouseMove)
                      document.addEventListener('mouseup', handleMouseUp)
                    }}
                    
                    // Touch events for mobile
                    onTouchStart={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                      
                      // Touch başlangıç değerleri
                      const startX = e.touches[0].clientX
                      const startY = e.touches[0].clientY
                      const startLat = coordinates.lat
                      const startLng = coordinates.lng
                      
                      const mapContainer = e.currentTarget.parentElement
                      const mapRect = mapContainer!.getBoundingClientRect()
                      
                      const handleTouchMove = (moveEvent: TouchEvent) => {
                        const touch = moveEvent.touches[0]
                        
                        // Touch hareketini hesapla
                        const deltaX = touch.clientX - startX
                        const deltaY = touch.clientY - startY
                        
                        // Dinamik zoom seviyesi ile hesaplama
                        const bboxSize = 0.02 / Math.pow(2, currentZoom - 16)
                        
                        const lngPerPixel = bboxSize / mapRect.width
                        const latPerPixel = bboxSize / mapRect.height
                        
                        const newLng = startLng - (deltaX * lngPerPixel)
                        const newLat = startLat + (deltaY * latPerPixel)
                        
                        setCoordinates({ lat: newLat, lng: newLng })
                        const locationText = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`
                        setFormData(prev => ({ ...prev, location: locationText }))
                      }
                      
                      const handleTouchEnd = () => {
                        setIsDragging(false) // iframe'i yenileyecek
                        document.removeEventListener('touchmove', handleTouchMove)
                        document.removeEventListener('touchend', handleTouchEnd)
                      }
                      
                      document.addEventListener('touchmove', handleTouchMove)
                      document.addEventListener('touchend', handleTouchEnd)
                    }}
                  >
                    {/* Hover efekti ve sürükleme durumu */}
                    <div className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${
                      isDragging 
                        ? 'bg-green-500/10 opacity-100 border-2 border-green-400 border-dashed' 
                        : 'bg-blue-500/5 opacity-0 hover:opacity-100'
                    }`}>
                      {!isDragging && <div className="w-full h-full border-2 border-blue-400 border-dashed"></div>}
                    </div>
                  </div>
                  
                  {/* Manuel Zoom Kontrolleri - OpenStreetMap'in zoom butonlarının üzerine */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 z-10 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentZoom(prev => Math.min(prev + 1, 19))}
                      className="w-10 h-10 bg-white border-b border-gray-200 rounded-t-lg hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 transition-colors"
                      title="Yakınlaştır"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentZoom(prev => Math.max(prev - 1, 10))}
                      className="w-10 h-10 bg-white rounded-b-lg hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 transition-colors"
                      title="Uzaklaştır"
                    >
                      −
                    </button>
                  </div>
                  
                  <div className="absolute bottom-2 left-2 right-2 backdrop-blur-sm px-3 py-2 rounded-lg bg-black/50 shadow-sm text-white transition-colors">
                    <p className="text-xs text-center font-medium">
                      Haritayı sürükleyerek konumu ayarlayın - Yakınlaştırma: {currentZoom}
                    </p>
                  </div>
                </div>
                
                {/* Koordinat Girişi ve Kontroller */}
                <div className="p-3 bg-gray-50 space-y-3">                  
                  {/* Kontrol Butonları */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const newCoords = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              }
                              setCoordinates(newCoords)
                              const locationText = `${newCoords.lat.toFixed(6)}, ${newCoords.lng.toFixed(6)}`
                              setFormData(prev => ({ ...prev, location: locationText }))
                            },
                            (error) => {
                              console.error('Konum alınamadı:', error)
                              alert('Konum izni verilmedi veya konum alınamadı.')
                            }
                          )
                        } else {
                          alert('Tarayıcınız konum hizmetlerini desteklemiyor.')
                        }
                      }}
                      className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Mevcut Konuma Git
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMapPicker(false)
                        alert('Konum başarıyla seçildi!')
                      }}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-700"
                    >
                      Konumu Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          
          {/* Etiket Ekleme */}
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Etiket adı..."
              />
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="İkon Seç"
              >
                {selectedIcon && availableIcons[selectedIcon] ? (
                  React.createElement(availableIcons[selectedIcon], { className: "w-4 h-4" })
                ) : (
                  <Tag className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* İkon Seçici */}
            {showIconPicker && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">İkon Seç:</h4>
                <div className="grid grid-cols-16 gap-2 max-h-48 overflow-y-auto">
                  {Object.entries(availableIcons).map(([iconName, IconComponent]) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(iconName)
                        setShowIconPicker(false)
                      }}
                      className={`p-2 rounded border-2 hover:bg-white transition-colors flex items-center justify-center ${
                        selectedIcon === iconName 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mevcut Etiketler */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {tag.icon && availableIcons[tag.icon] && 
                  React.createElement(availableIcons[tag.icon], { className: "w-3 h-3" })
                }
                {tag.name}
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
          
          {/* HTML Formatting Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Text Style Buttons */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Metin Stili:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<b>${selectedText}</b>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-bold"
                >
                  <b>Kalın</b>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<i>${selectedText}</i>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs italic"
                >
                  <i>İtalik</i>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<u>${selectedText}</u>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs underline"
                >
                  <u>Altı Çizili</u>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<s>${selectedText}</s>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs line-through"
                >
                  <s>Üstü Çizili</s>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const newText = formData.description.substring(0, start) + '<br>' + formData.description.substring(start)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                >
                  Satır Başı
                </button>
              </div>
            </div>

            {/* Text Alignment Buttons */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Hizalama:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<div style="text-align: left">${selectedText}</div>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  title="Sola Hizala"
                >
                  ⬅
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<div style="text-align: center">${selectedText}</div>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  title="Ortala"
                >
                  ↔
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<div style="text-align: right">${selectedText}</div>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  title="Sağa Hizala"
                >
                  ➡
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<div style="text-align: justify">${selectedText}</div>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  title="İki Yana Yasla"
                >
                  ⬌
                </button>
              </div>
            </div>

            {/* Text Size Buttons */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Yazı Boyutu:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="font-size: 12px">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  style={{ fontSize: '10px' }}
                >
                  Küçük
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="font-size: 18px">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs"
                  style={{ fontSize: '14px' }}
                >
                  Büyük
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="font-size: 24px; font-weight: bold">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-bold"
                  style={{ fontSize: '16px' }}
                >
                  Başlık
                </button>
              </div>
            </div>

            {/* Text Color Buttons */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Yazı Rengi:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #dc2626">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-red-600 hover:bg-red-700 border border-gray-300 rounded"
                  title="Kırmızı"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #16a34a">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-green-600 hover:bg-green-700 border border-gray-300 rounded"
                  title="Yeşil"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #2563eb">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-blue-600 hover:bg-blue-700 border border-gray-300 rounded"
                  title="Mavi"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #ea580c">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-orange-600 hover:bg-orange-700 border border-gray-300 rounded"
                  title="Turuncu"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #9333ea">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-purple-600 hover:bg-purple-700 border border-gray-300 rounded"
                  title="Mor"
                />
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description') as HTMLTextAreaElement
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const selectedText = formData.description.substring(start, end)
                    const newText = formData.description.substring(0, start) + `<span style="color: #e3ff31ff">${selectedText}</span>` + formData.description.substring(end)
                    setFormData(prev => ({ ...prev, description: newText }))
                  }}
                  className="w-6 h-6 bg-yellow-200 hover:bg-yellow-300 border border-yellow-300 rounded"
                  title="Sarı"
                />
              </div>
            </div>
          </div>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 font-mono text-sm"
            placeholder="İlan açıklamasını girin... 

Örnek kullanım:
<div style='text-align: center;'>
<span style='color: #dc2626; font-size: 24px;'><b>ÖZEL FIRSAT!</b></span>
</div>
<br>
Bu <u>muhteşem</u> daire ile hayallerinizi gerçekleştirin.
<br><br>
<div style='text-align: left;'>
<span style='color: #16a34a;'>✓ Geniş balkon</span><br>
<span style='color: #16a34a;'>✓ Modern mutfak</span><br>
<span style='color: #16a34a;'>✓ Merkezi konum</span>
</div>
<br>
<div style='text-align: center;'>
<s>Eski fiyat: 500.000₺</s><br>
<span style='color: #dc2626; font-size: 18px;'><b>Yeni fiyat: 450.000₺</b></span>
</div>
<br>
<div style='text-align: right;'>
<i>Detaylı bilgi için arayınız.</i>
</div>"
          />
          {formData.description && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600 mb-2">Önizleme:</p>
              <div 
                className="text-sm text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </div>
          )}
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
