'use client'

import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="w-full bg-primary-50 hover:bg-primary-10 text-primary-700 font-medium py-3 px-6 rounded-lg border border-primary-300/35 transition-colors duration-200 flex items-center justify-center space-x-2"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Geri Dön</span>
    </button>
  )
}
