'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Search, Home, Loader2, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getDisplayLocation } from '../lib/geocoding'

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  location: string
  images: {
    id: string
    url: string
  }[]
  tags: string | null
}

interface SearchResponse {
  properties: Property[]
  error?: string
}

interface SearchClientProps {
  readonly propertyCardEnabled: boolean
}

export default function SearchClient({ propertyCardEnabled }: SearchClientProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(query)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchProperties = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProperties([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
      const data: SearchResponse = await response.json()
      
      if (data.error) {
        setError(data.error)
        setProperties([])
      } else {
        setProperties(data.properties)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Arama yapılırken bir hata oluştu')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchProperties(query)
  }, [query])

  useEffect(() => {
    // Sayfa yüklendiğinde input'a odaklan
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // URL'yi güncelle ve arama yap
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`)
      searchProperties(searchQuery.trim())
    }
  }

  return (
    <div className="min-h-screen bg-primary-100">
      {/* Header */}
      <header className="bg-primary-50 shadow-sm border-b border-primary-100/20 sticky top-0 z-50 shadow-xl">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full bg-primary-200 hover:bg-primary-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-800" />
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İlan ara..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary-800 placeholder-primary-500"
                autoComplete="off"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => searchProperties(searchQuery)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {!loading && !error && !query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-primary-600 mb-4" />
            <h3 className="text-lg font-bold text-primary-600 mb-2">İlan Arayın</h3>
            <p className="text-gray-500">Aradığınız ilanı bulmak için yukarıdaki arama kutusunu kullanın</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && query && properties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              <span className="font-medium">&quot;{query}&quot;</span> için sonuç bulunamadı
            </p>
            <p className="text-sm text-gray-400">
              Farklı kelimeler kullanarak tekrar deneyin
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && properties.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-primary-800 font-medium">
                <span className="font-medium">{properties.length}</span> ilan bulundu
              </p>
            </div>

            <div className="space-y-4">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="flex">
                    <div className="relative w-32 h-24 flex-shrink-0">
                      {property.images[0] ? (
                        <Image
                          src={property.images[0].url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-primary-400 to-primary-600 w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <h3 className="font-bold text-primary-800 text-sm mb-1 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-primary-500 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        {getDisplayLocation(property.location)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary-700 text-lg">
                          {property.price.toLocaleString('tr-TR')}₺
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
