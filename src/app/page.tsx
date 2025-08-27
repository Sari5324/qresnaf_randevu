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

  // Get staff members with work schedules
  const staff = await prisma.staff.findMany({
    include: {
      workSchedule: true
    },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-primary-300">
      {/* Header Section - QR Design */}
      <header className="shadow-xl bg-primary-50/75 backdrop-blur-xl border-b border-primary-100/20 z-50" >
        <div className="text-center max-w-md mx-auto px-4 h-full flex flex-col justify-center">
          
          {/* Company Logo */}
          <div className="mb-4">
            {siteSettings?.companyLogo ? (
              <img
                src={siteSettings.companyLogo}
                alt="Şirket Logosu"
                className="object-contain rounded mx-auto"
                style={{ width: '100px', height: '100px' }}
              />
            ) : (
              <img
                src="https://ornek-menu.qresnaf.com/_next/image?url=%2Fuploads%2F1755565506666-a2sa7xv05tc.png&w=256&q=75"
                alt="QR Logo"
                className="object-contain mx-auto"
                style={{ width: '100px', height: '100px' }}
              />
            )}
          </div>

          {/* Company Name */}
          <h1 className="text-2xl font-bold text-primary-800">
            {siteSettings?.companyName || 'EsnaF'}
          </h1>

          {/* Description */}
          {siteSettings?.description && (
            <p className="text-primary-950 text-sm mb-4 leading-relaxed px-4">
              {siteSettings.description}
            </p>
          )}

          {/* Randevu Sorgulama Button */}
          <div className="flex justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 mb-1 hover:bg-primary-700 text-white font-semibold py-3 px-25 rounded-full transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              
            >
              <Search className="w-4 h-4" />
              <span>Randevu Sorgula</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content - Appointment Form */}
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