import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Home, MapPin, Image as ImageIcon, Sparkles } from 'lucide-react'
import SearchInput from '@/components/SearchInput'
import ViewTracker from '@/components/ViewTracker'

export const revalidate = 0 // Disable caching for theme updates

export default async function HomePage() {
  // Get site settings
  const siteSettings = await prisma.siteSettings.findFirst()

  // Get featured properties (first 2)
  const featuredProperties = await prisma.property.findMany({
    where: { isFeatured: true },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1
      },
      tags: true
    },
    orderBy: { order: 'asc' },
    take: 2
  })

  // Get all properties
  const allProperties = await prisma.property.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1
      },
      tags: true
    },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-primary-100">
      {/* Header */}
      <header className="shadow-sm bg-primary-50 border-b border-primary-100/20 z-50 shadow-xl">
        <div className="max-w-md mx-auto px-4 py-6 text-center">
          {siteSettings?.companyLogo && (
            <div className="mb-2">
              <Image
                src={siteSettings.companyLogo}
                alt={siteSettings.companyName || 'Logo'}
                width={100}
                height={100}
                priority
                className="mx-auto rounded-full"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-primary-800">
            {siteSettings?.companyName || 'Sanal Emlak'}
          </h1>
          {siteSettings?.description && (
            <p className="text-primary-950 text-sm">
              {siteSettings.description}
            </p>
          )}
        </div>
      {/* Search Bar */}
      <SearchInput />
      </header>

      {/* Öne Çıkan İlanlar */}
      {featuredProperties.length > 0 && (
        <section className="max-w-md mx-auto px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
            Öne Çıkan İlanlar
          </h2>
          <div className="space-y-3">
            {featuredProperties.map((property, index) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="block rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-primary-50 overflow-hidden"
              >
                {property.images[0] ? (
                  <div className="relative h-72">
                    <Image
                      src={property.images[0].url}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-primary-600 text-primary-50 px-2 py-1 rounded-xl text-xs font-bold">
                      ÖNE ÇIKAN
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg text-shadow-md">{property.title}</h3>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 text-white/80 text-sm text-shadow-md">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                        </span>
                        <span className="text-2xl font-bold text-white text-shadow-md">
                          {property.price.toLocaleString('tr-TR')}₺
                        </span>
                      </div>
                      <div className="mt-1">
                        {property.tags.length > 0 && (
                          <div className="grid grid-cols-3 gap-1">
                            {property.tags.slice(0, 3).map((tag) => (
                              <span key={tag.id} className="text-xs bg-primary-200/90 text-primary-600 text-center px-2 py-1 rounded">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Home className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tüm İlanlar */}
      <main className="max-w-md mx-auto px-4 pb-8 pt-4">
        <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
          Tüm İlanlar
        </h2>
        
        <div className="space-y-4">
          {allProperties.map((property, index) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="block rounded-lg shadow-sm hover:shadow-md transition-all duration-700 ease-out transform animate-slideUp bg-primary-50 overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <ViewTracker 
                propertyId={property.id}
              />
              <div className="flex space-x-4 my-auto min-h-30">
                  {property.images[0] ? (
                    <>
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        width={100}
                        height={100}
                        className="rounded-tl-lg rounded-bl-lg object-cover w-25 h-30 flex-shrink-0"
                      />
                      {property.isFeatured && (
                        <div className="absolute top-1 left-1 bg-primary-600 text-primary-50 px-2 py-1 rounded-xl text-xs font-bold">
                          <Sparkles className="inline w-4 h-4"/>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-25 h-30 my-auto bg-primary-200 rounded-tl-lg rounded-bl-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-500 text-2xl"><ImageIcon /></span>
                    </div>
                  )}
                <div className="flex-1 min-w-0 flex flex-col h-30">
                  <h3 className="font-bold text-primary-800 text-sm mb-1 mt-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {property.location}
                  </div>
                  <div id="bottom_of_card" className="flex justify-between items-center mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {property.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="text-xs mb-2 bg-primary-200/80 text-primary-600 px-2 py-0.5 rounded">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <span className="font-bold text-primary-700 mr-2 mb-2 text-lg">
                      {property.price.toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {allProperties.length === 0 && (
          <div className="text-center py-12 animate-slideUp"
             style={{
               animationDelay: '0ms',
               animationFillMode: 'both'
             }}>
            <div className="text-gray-400 text-6xl mb-6">
              <Home className="mx-auto w-16 h-16 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-primary-600 mb-2">Henüz ilan eklenmemiş</h3>
            <p className="text-gray-500">İlk ilanınızı eklemek için admin paneline gidin.</p>
          </div>
        )}
      </main>
    </div>
  )
}
