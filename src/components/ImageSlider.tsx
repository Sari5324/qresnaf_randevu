'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

interface PropertyImage {
  id: string
  url: string
  order: number
}

interface ImageSliderProps {
  images: PropertyImage[]
  title: string
  isFeatured?: boolean
}

export default function ImageSlider({ images, title, isFeatured }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const goToPrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
    setTimeout(() => setIsAnimating(false), 300)
  }

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
    setTimeout(() => setIsAnimating(false), 300)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return
    currentXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isDragging || images.length <= 1) return
    setIsDragging(false)
    
    const deltaX = currentXRef.current - startXRef.current
    const threshold = 50 // Minimum swipe distance
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swiped right, go to previous
        goToPrevious()
      } else {
        // Swiped left, go to next
        goToNext()
      }
    }
  }

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return
    setIsDragging(true)
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || images.length <= 1) return
    currentXRef.current = e.clientX
  }

  const handleMouseUp = () => {
    if (!isDragging || images.length <= 1) return
    setIsDragging(false)
    
    const deltaX = currentXRef.current - startXRef.current
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
    }
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        <div className="w-24 h-24 text-white/50">
          <ImageIcon className="w-24 h-24"/>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={sliderRef}
      className="aspect-square relative bg-primary-100 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: images.length > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Images Container with Slide Animation */}
      <div 
        className={`flex ease-out ${
          isDragging ? 'transition-none' : 'transition-transform duration-300'
        }`}
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: '100%',
          height: '100%'
        }}
      >
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="w-full h-full flex-shrink-0 relative"
          >
            <Image
              src={image.url}
              alt={title}
              fill
              priority={index === 0}
              className="object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            aria-label="Önceki resim"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            aria-label="Sonraki resim"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium transition-opacity duration-300">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-2 left-2 bg-primary-600 text-primary-50 px-2 py-1 rounded-xl text-xs font-bold animate-pulse">
          ÖNE ÇIKAN
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true)
                  setCurrentIndex(index)
                  setTimeout(() => setIsAnimating(false), 300)
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70 hover:scale-110'
              }`}
              aria-label={`Resim ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
