import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import ViewTracker from '@/components/ViewTracker'
import ImageSlider from '@/components/ImageSlider'
import PropertyTagComponent from '@/components/PropertyTag'
import { getDisplayLocation } from '@/lib/geocoding'
import { notFound } from 'next/navigation'

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' }
      },
      tags: true
    }
  })

  if (!property) {
    notFound()
  }

  // Get site settings for header
  const siteSettings = await prisma.siteSettings.findFirst()

  const displayLocation = getDisplayLocation(property.location)

  return (
    <div className="min-h-screen bg-primary-100">
      <ViewTracker propertyId={property.id} />
      
      {/* Header */}
      <header className="bg-primary-50 shadow-sm border-b border-primary-100/20 sticky top-0 z-50 shadow-xl">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-primary-600 hover:text-primary-800 flex-shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* Property Images */}
      <div className="max-w-md mx-auto">
        <ImageSlider 
          images={property.images} 
          title={property.title}
          isFeatured={property.isFeatured}
        />
      </div>

      {/* Property Info */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Title and Price */}
        <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            <div>
            <h2 className="text-2xl font-bold text-primary-800 mr-3">
              {property.title}
            </h2>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="text-lg font-medium text-primary-600">
                  {displayLocation}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-700">
                {property.price.toLocaleString('tr-TR')}₺
              </span>
              {property.minOfferPrice && (
                <p className="text-sm text-primary-600 mt-1">
                  Minimum verilebilecek teklif: {property.minOfferPrice.toLocaleString('tr-TR')}₺
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            {property.tags.length > 0 && (
              <div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {property.tags.map((tag) => (
                    <PropertyTagComponent
                      key={tag.id}
                      tag={tag}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video */}
        {property.video && (
          <div className="bg-primary-50 rounded-lg shadow-sm">
            <div className="aspect-video">
              <iframe
                src={(() => {
                  let videoId = ''
                  if (property.video.includes('youtube.com/watch?v=')) {
                    videoId = property.video.split('watch?v=')[1].split('&')[0]
                  } else if (property.video.includes('youtu.be/')) {
                    videoId = property.video.split('youtu.be/')[1].split('?')[0]
                  } else if (property.video.includes('youtube.com/embed/')) {
                    return property.video
                  }
                  return `https://www.youtube.com/embed/${videoId}`
                })()}
                title="Youtube Video"
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
            <div
              className="text-primary-950 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          </div>
        )}

        {/* Konum Haritası */}
        <div className="bg-primary-50 rounded-lg shadow-sm">
          <div className="aspect-video rounded-lg overflow-hidden bg-primary-100">
            <iframe
              src={(() => {
                // Konum koordinat formatında mı kontrol et (örn: "41.0082, 28.9784")
                const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/
                const match = property.location.match(coordPattern)
                
                if (match) {
                  // Koordinat formatında ise
                  const lat = parseFloat(match[1])
                  const lng = parseFloat(match[2])
                  const bbox = `${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}`
                  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
                } else {
                  // Metin formatında ise arama yap
                  return `https://www.openstreetmap.org/export/embed.html?bbox=28.9,40.9,29.1,41.1&layer=mapnik&search=${encodeURIComponent(property.location)}`
                }
              })()}
              title="Konum Haritası"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
          <div className="space-y-4 text-sm text-primary-600">
            <div className="flex items-center gap-2">
              <span>Yayınlanma: {new Date(property.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>İlan No: {property.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
