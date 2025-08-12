import { prisma } from '@/lib/prisma'
import AppointmentSearchClient from '@/components/AppointmentSearchClient'

export const revalidate = 0

export default async function AppointmentSearchPage() {
  // Get site settings
  const siteSettings = await prisma.siteSettings.findFirst()

  return (
    <div 
      style={{
        '--theme-color': siteSettings?.themeColor || '#3B82F6'
      } as React.CSSProperties}
      className={`${siteSettings?.themeFont || 'inter'} ${siteSettings?.darkMode ? 'dark' : ''}`}
    >
      <AppointmentSearchClient />
    </div>
  )
}