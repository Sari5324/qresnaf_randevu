'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SliderImage {
  id: string
  name: string
  url: string
  description?: string | null
}

interface ModernSliderProps {
  images: SliderImage[]
}

export default function ModernSlider({ images }: ModernSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, images.length])

  const nextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Henüz görsel eklenmemiş</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 group">
      {/* Main Image Container */}
      <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        
        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority={currentIndex === 0}
            className={`object-cover transition-all duration-300 ${
              isTransitioning ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
          <div className="text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-1 drop-shadow-lg">
              {images[currentIndex].name}
            </h3>
            {images[currentIndex].description && (
              <p className="text-sm sm:text-base text-white/90 drop-shadow-lg line-clamp-2">
                {images[currentIndex].description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Her zaman görünür, daha küçük ve sade */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 
                     bg-white/80 hover:bg-white text-gray-800 
                     w-8 h-8 rounded-full 
                     flex items-center justify-center shadow-md
                     transition-all duration-200 hover:scale-105
                     backdrop-blur-sm border border-white/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 
                     bg-white/80 hover:bg-white text-gray-800 
                     w-8 h-8 rounded-full 
                     flex items-center justify-center shadow-md
                     transition-all duration-200 hover:scale-105
                     backdrop-blur-sm border border-white/30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {images.length > 1 && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{
              width: '100%',
              animation: 'slideProgress 5s linear infinite'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
