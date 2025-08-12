import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { User, Search, ChevronRight, ChevronLeft } from 'lucide-react'
import ViewTracker from '@/components/ViewTracker'
import ClientAppointmentPage from '@/components/ClientAppointmentPage'

export const revalidate = 0 // Disable caching for theme updates

export default async function HomePage() {
  // Get site settings
  const siteSettings = await prisma.siteSettings.findFirst()

  // Get slider images
  const sliderImages = await prisma.sliderImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  })

  // Get staff members
  const staff = await prisma.staff.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Logo */}
      <header className="bg-primary-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* QR Logo */}
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-black rounded-lg flex items-center justify-center bg-white">
                  <span className="text-primary-600 font-black text-lg sm:text-2xl">QR</span>
                </div>
                {/* Corner brackets */}
                <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-3 sm:w-4 h-3 sm:h-4 border-l-3 sm:border-l-4 border-t-3 sm:border-t-4 border-black"></div>
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 border-r-3 sm:border-r-4 border-t-3 sm:border-t-4 border-black"></div>
                <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-3 sm:w-4 h-3 sm:h-4 border-l-3 sm:border-l-4 border-b-3 sm:border-b-4 border-black"></div>
                <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 border-r-3 sm:border-r-4 border-b-3 sm:border-b-4 border-black"></div>
              </div>
              {/* EsnaF Text */}
              <h1 className="text-2xl sm:text-4xl font-black text-black">
                EsnaF
              </h1>
            </div>
          </div>
          
          {siteSettings?.description && (
            <p className="text-gray-600 text-sm mb-4 text-center px-4">
              {siteSettings.description}
            </p>
          )}
          
          {/* Navigation Button */}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            Randevu Sorgula
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <ClientAppointmentPage 
        staff={staff} 
        sliderImages={sliderImages} 
        siteSettings={siteSettings}
      />

      {/* Add ViewTracker for analytics */}
      <ViewTracker appointmentId={null} />
    </div>
  )
}