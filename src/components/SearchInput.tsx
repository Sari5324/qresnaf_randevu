'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // URL hash'inde search varsa input'a odaklan
    if (window.location.hash === '#search' && inputRef.current) {
      inputRef.current.focus()
      // Hash'i temizle
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('search') as string
    
    if (query.trim()) {
      // Arama sayfasına yönlendir
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 mb-4">
      <form className="relative" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          name="search"
          placeholder="İlan Ara..."
          className="w-full pl-4 py-2 bg-transparent text-primary-900 placeholder-primary-400 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-300 hover:text-primary-500 transition-colors duration-300"
        >
          <Search className="w-5 h-5 mr-2" />
        </button>
      </form>
    </div>
  )
}
