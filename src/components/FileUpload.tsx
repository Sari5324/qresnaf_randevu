'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
  readonly label: string
  readonly accept?: string
  readonly currentImage?: string | null
  readonly onFileSelect: (files: File[] | File | null) => void
  readonly onImageRemove?: () => void
  readonly error?: string
  readonly className?: string
  readonly multiple?: boolean
}

export default function FileUpload({
  label,
  accept = "image/*",
  currentImage,
  onFileSelect,
  onImageRemove,
  error,
  className = "",
  multiple = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (multiple) {
      const fileArray = Array.from(files)
      const validFiles: File[] = []
      const newPreviews: string[] = []

      fileArray.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) return

        // Validate file size (max 16MB)
        if (file.size > 16 * 1024 * 1024) {
          alert('Dosya boyutu 16MB\'dan küçük olmalıdır')
          return
        }

        validFiles.push(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          if (newPreviews.length === validFiles.length) {
            setPreviews(prev => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })

      if (validFiles.length > 0) {
        onFileSelect(validFiles)
      }
    } else {
      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }

      // Validate file size (max 16MB)
      if (file.size > 16 * 1024 * 1024) {
        alert('Dosya boyutu 16MB\'dan küçük olmalıdır')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews([e.target?.result as string])
      }
      reader.readAsDataURL(file)

      onFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviews([])
    onFileSelect(null)
    if (onImageRemove) {
      onImageRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = previews[0] || currentImage

  // Determine border classes
  const getBorderClasses = () => {
    if (dragActive) return 'border-blue-400 bg-blue-50'
    if (error) return 'border-red-300 bg-red-50'
    return 'border-gray-300 hover:border-gray-400'
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="space-y-4">
        {/* Current/Preview Image */}
        {displayImage && (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={displayImage}
                alt="Preview"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        <button
          type="button"
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full ${getBorderClasses()}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
          />
          
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
              {dragActive ? (
                <Upload className="w-6 h-6 text-blue-500" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Dosya seçin
                </span>
                {' '}veya sürükleyip bırakın
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF - Maksimum 16MB
              </p>
            </div>
          </div>
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
