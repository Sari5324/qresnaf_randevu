'use client'

import { useState } from 'react'

interface SliderImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
}

export default function SliderImageWithFallback({ src, alt, className, fill }: SliderImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setImgSrc('/placeholder-campaign.jpg')
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      className={`${className} ${fill ? 'absolute inset-0 w-full h-full' : ''}`}
      src={imgSrc} 
      alt={alt}
      onError={handleError}
    />
  )
}
