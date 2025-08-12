'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isAdminHome = pathname === '/admin'

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('Admin navigation error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-300/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {isAdminHome ? (
                <Link href="https://qresnaf.com" target="_blank" className="flex items-center space-x-2">
                <Image src="/logo.png" alt="Logo" width={48} height={48} priority/>
                </Link>
              ) : (
                <Link href="/admin" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Geri Dön</span>
                </Link>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">              
                <div className="flex items-center space-x-4">
                  <Link
                    className="block h-full px-4 py-2 rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-950"
                    href="/"
                    target="_blank"
                  >
                    Siteyi Görüntüle
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block h-full px-4 py-2 rounded-md bg-red-900 text-white hover:bg-red-950"
                  >
                    Çıkış Yap
                  </button>
                </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isDropdownOpen && (
        <div className="sm:hidden">
          <div className="bg-gray-300 border-b border-gray-400/40">
            <div className="space-y-1">
              <Link
                href="/"
                className="block w-full px-4 py-2 mb-0 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Siteyi Görüntüle
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
