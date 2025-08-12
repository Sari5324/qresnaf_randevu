'use client'

import { useState } from 'react'

interface SliderImageWithFallbackProps {
  src: string
  alt: string
  className?: string
}

export default function SliderImageWithFallback({ src, alt, className }: SliderImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setImgSrc('/placeholder-campaign.jpg')
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      className={className}
      src={imgSrc} 
      alt={alt}
      onError={handleError}
    />
  )
}
