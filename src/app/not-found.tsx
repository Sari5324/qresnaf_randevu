'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import BackButton from '@/components/BackButton'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-primary-200 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="w-16 h-16 text-primary-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-primary-900">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Aradığınız sayfa mevcut değil veya kaldırılmış olabilir. 
            Lütfen URL&apos;yi kontrol edin veya ana sayfaya dönün.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>Menüyü Görüntüle</span>
          </Link>
          
          <BackButton />
        </div>
      </div>
    </div>
  )
}
