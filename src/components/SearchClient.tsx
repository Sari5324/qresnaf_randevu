'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Search, ImageIcon, Loader2, MapPin } from 'lucide-react'
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
  tags: {
    id: string
    name: string
  }[]
}

interface SearchResponse {
  properties: Property[]
  error?: string
}

export default function SearchClient() {
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
          <Link href="/" className="text-primary-600 hover:text-primary-800 flex-shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          {/* Search Form */}
          <form className="flex-1 relative" onSubmit={handleSearch}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arama Yapın..."
              className="w-full px-4 py-2 bg-transparent text-primary-900 placeholder-primary-400 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors duration-300"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Search Info */}
        {query && (
          <div className="mb-1">
            <h1 className="text-lg font-semibold text-primary-800 mb-1">
              Arama Sonuçları
            </h1>
            <p className="text-primary-600 text-sm">
              &quot;<span className="font-medium">{query}</span>&quot; için sonuçlar
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && query && properties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-primary-300 mb-4" />
            <h2 className="text-lg font-medium text-primary-700 mb-2">
              Sonuç Bulunamadı
            </h2>
            <p className="text-primary-500 text-sm mb-4">
              &quot;<span className="font-medium">{query}</span>&quot; için herhangi bir ilan bulunamadı.
            </p>
            <p className="text-primary-400 text-xs">
              Farklı anahtar kelimeler deneyebilirsiniz.
            </p>
          </div>
        )}

        {/* Empty State (no search query) */}
        {!loading && !query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-primary-300 mb-4" />
            <h2 className="text-lg font-medium text-primary-700 mb-2">
              Arama Yapın
            </h2>
            <p className="text-primary-500 text-sm">
              İlan adı, açıklama, konum veya fiyat ile arama yapabilirsiniz.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && properties.length > 0 && (
          <div className="space-y-4">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-primary-600 text-sm">
                <span className="font-medium">{properties.length}</span> ilan bulundu
              </p>
            </div>

            {/* Property List */}
            <div className="space-y-4">
              {properties.map((property, index) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block rounded-lg shadow-sm hover:shadow-md transition-all duration-700 ease-out transform animate-slideUp bg-primary-50 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex space-x-4 my-auto min-h-30">
                    {property.images[0] ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        width={100}
                        height={100}
                        className="rounded-tl-lg rounded-bl-lg object-cover w-25 h-30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-25 h-30 my-auto bg-primary-200 rounded-tl-lg rounded-bl-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-500 text-2xl"><ImageIcon /></span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col h-30">
                      <h3 className="font-bold text-primary-800 text-sm mb-1 mt-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-primary-500 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        {getDisplayLocation(property.location)}
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex flex-wrap gap-1">
                          {property.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="text-xs mb-2 bg-primary-200/80 text-primary-600 px-2 py-0.5 rounded">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-primary-700 mr-4 mb-2 text-lg">
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
