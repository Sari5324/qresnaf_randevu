import { prisma } from '@/lib/prisma'
import AppointmentSearchClient from '@/components/AppointmentSearchClient'
import ViewTracker from '@/components/ViewTracker'

export const revalidate = 0

export default async function AppointmentSearchPage() {
  // Get site settings
  const siteSettings = await prisma.siteSettings.findFirst()

  return (
    <div className="min-h-screen bg-radial-[at_50%_0%] from-primary-300 via-primary-200 to-primary-50">
      <AppointmentSearchClient siteSettings={siteSettings} />
      
      {/* Add ViewTracker for analytics */}
      <ViewTracker appointmentId={null} />
    </div>
  )
}