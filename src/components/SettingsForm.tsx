'use client'

import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'

interface SiteSettings {
  id: string
  companyName: string
  companyLogo: string | null
  description: string | null
  themeColor: string
  themeFont: string
  businessNumber: string | null
  darkMode: boolean
  createdAt: Date
  updatedAt: Date
}

interface SettingsFormProps {
  readonly settings: SiteSettings | null
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: settings?.companyName || 'Sanal Menü',
    description: settings?.description || '',
    themeColor: settings?.themeColor || '#3B82F6',
    themeFont: settings?.themeFont || 'inter',
    companyLogo: settings?.companyLogo || '',
    darkMode: settings?.darkMode || false,
    businessNumber: settings?.businessNumber || ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const [isInitialized, setIsInitialized] = useState(false)

  // Update form data when settings prop changes - only on first load
  useEffect(() => {
    if (settings && !isInitialized) {
      setFormData({
        companyName: settings.companyName || 'Sanal Menü',
        description: settings.description || '',
        themeColor: settings.themeColor || '#3B82F6',
        themeFont: settings.themeFont || 'inter',
        companyLogo: settings.companyLogo || '',
        darkMode: settings.darkMode || false,
        businessNumber: settings.businessNumber || ''
      })
      setIsInitialized(true)
    }
  }, [settings, isInitialized])
  const handleFileSelect = (files: File | File[] | null) => {
    const file = Array.isArray(files) ? files[0] : files
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    
    if (file) {
      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)
    } else {
      setPreviewUrl(null)
    }
    
    setSelectedFile(file)
  }

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleImageRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setFormData(prev => ({ ...prev, companyLogo: '' }))
    setSelectedFile(null)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Şirket adı gereklidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Dosya yükleme hatası')
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      let logoUrl = formData.companyLogo

      // Upload new file if selected
      if (selectedFile) {
        logoUrl = await uploadFile(selectedFile)
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyLogo: logoUrl || null
        }),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        
        // Update form data with the saved values
        setFormData({
          companyName: updatedSettings.companyName || 'Sanal Randevu',
          description: updatedSettings.description || '',
          themeColor: updatedSettings.themeColor || '#3B82F6',
          themeFont: updatedSettings.themeFont || 'inter',
          companyLogo: updatedSettings.companyLogo || '',
          darkMode: updatedSettings.darkMode || false,
          businessNumber: updatedSettings.businessNumber || ''
        })
        
        // Clear selected file and preview
        setSelectedFile(null)
        setPreviewUrl(null)
        
        // Show success message
        alert('Ayarlar başarıyla güncellendi!')
        
        // Only reload if theme changed to apply CSS changes
        if (updatedSettings.themeColor !== settings?.themeColor || 
            updatedSettings.themeFont !== settings?.themeFont ||
            updatedSettings.darkMode !== settings?.darkMode) {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        const errorData = await response.json()
        setErrors(errorData.errors || { general: 'Bir hata oluştu' })
      }
    } catch (error) {
      console.error('Settings form error:', error)
      setErrors({ general: 'Bağlantı hatası oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Predefined theme colors
  const themeColors = [
    { name: 'Kırmızı', value: '#EF4444' },
    { name: 'Turuncu', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sarı', value: '#EAB308' },
    { name: 'Lime', value: '#84CC16' },
    { name: 'Yeşil', value: '#22C55E' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Gökyüzü', value: '#0EA5E9' },
    { name: 'Mavi', value: '#3B82F6' },
    { name: 'İndigo', value: '#6366F1' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Mor', value: '#A855F7' },
    { name: 'Fuchsia', value: '#D946EF' },
    { name: 'Pembe', value: '#EC4899' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Slate', value: '#64748B' },
    { name: 'Gri', value: '#6B7280' },
    { name: 'Zinc', value: '#71717A' },
    { name: 'Neutral', value: '#737373' },
    { name: 'Stone', value: '#78716C' }
  ]

  // Available fonts
  const availableFonts = [
    { name: 'Inter (Varsayılan)', value: 'inter' },
    { name: 'Grenze Gotisch', value: 'grenze-gotisch' },
    { name: 'Gluten', value: 'gluten' },
    { name: 'Fredoka', value: 'fredoka' },
    { name: 'Newsreader', value: 'newsreader' },
    { name: 'Playwrite US Modern', value: 'playwrite-us-modern' },
    { name: 'Phudu', value: 'phudu' },
    { name: 'Playfair', value: 'playfair' },
    { name: 'Michroma', value: 'michroma' },
    { name: 'Advent Pro', value: 'advent-pro' }
  ]

  return (
    <form onSubmit={handleSubmit} className="">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Site Ayarları
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Şirket bilgilerini ve tema ayarlarını düzenleyin
        </p>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-4 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Şirket Adı *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Şirket adını girin"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Şirket Açıklaması 
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Şirket açıklamasını girin"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Business Number */}
        <div>
          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-2">
            İş Yeri Numarası (Bilgi Kartında Gözükecektir.)
          </label>
          <input
            type="text"
            id="businessNumber"
            name="businessNumber"
            value={formData.businessNumber}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="İş yeri numarasını girin"
          />
          {errors.businessNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.businessNumber}</p>
          )}
        </div>

        {/* Theme Color */}
        <div>
          <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700 mb-2">
            Tema Rengi *
          </label>
          <div className="mb-3">
            <input
              type="color"
              name="themeColor"
              id="themeColor"
              value={formData.themeColor}
              onChange={handleInputChange}
              className="w-full h-10 border px-1 border-gray-300 rounded cursor-pointer"
              title="Özel renk seçin"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {themeColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, themeColor: color.value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  formData.themeColor === color.value
                    ? 'border-gray-600/20 ring-2 ring-gray-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                <div className="h-4 rounded" style={{ backgroundColor: color.value }}></div>
              </button>
            ))}
          </div>
          {errors.themeColor && (
            <p className="mt-1 text-sm text-red-600">{errors.themeColor}</p>
          )}
        </div>

        {/* Theme Font */}
        <div>
          <label htmlFor="themeFont" className="block text-sm font-medium text-gray-700 mb-2">
            Tema Fontu *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableFonts.map((font) => (
              <button
                key={font.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, themeFont: font.value }))}
                className={`p-3 text-left rounded-lg border-2 transition-all font-${font.value} ${
                  formData.themeFont === font.value
                    ? 'border-gray-600 ring-2 ring-gray-400 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {font.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Örnek Yazı Aa
                </div>
              </button>
            ))}
          </div>
          {errors.themeFont && (
            <p className="mt-1 text-sm text-red-600">{errors.themeFont}</p>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div>
          <label htmlFor="darkMode" className="block text-sm font-medium text-gray-700 mb-2">
            Karanlık Mod
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                formData.darkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.darkMode}
              id="darkMode"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-900">
              {formData.darkMode ? 'Açık' : 'Kapalı'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Ana sayfa, kategori ve arama sayfalarında karanlık tema kullanılır
          </p>
        </div>

        {/* Company Logo */}
        <div className="space-y-2">
          <FileUpload
            label="Şirket Logosu (Ana Sayfada Görünecek)"
            currentImage={formData.companyLogo}
            onFileSelect={handleFileSelect}
            onImageRemove={handleImageRemove}
            error={errors.companyLogo}
          />
          <p className="text-sm text-gray-500">
            Logo yüklemezseniz varsayılan QResnaf logosu kullanılacaktır.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Yükleniyor...
            </>
          ) : (
            <>
              Güncelle
            </>
          )}
        </button>
      </div>
    </form>
  )
}
