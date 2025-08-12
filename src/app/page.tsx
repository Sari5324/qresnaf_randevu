import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Search } from 'lucide-react'
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
            {/* Company Logo */}
            {siteSettings?.companyLogo ? (
              <img
                src={siteSettings.companyLogo}
                alt="Şirket Logosu"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg shadow-sm"
              />
            ) : (
              <img
                src="https://qresnaf.com/private/assets/img/only_qr_logo.png"
                alt="QResnaf Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg shadow-sm"
              />
            )}
            {/* Company Name */}
            <h1 className="text-2xl sm:text-4xl font-black text-black">
              {siteSettings?.companyName || 'EsnaF'}
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