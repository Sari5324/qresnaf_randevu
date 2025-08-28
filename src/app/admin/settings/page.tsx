import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/SettingsForm'

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  // Get session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  
  if (!sessionCookie) {
    redirect('/admin/login')
  }

  const session = parseSessionToken(sessionCookie)
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Get current site settings
  const siteSettings = await prisma.siteSettings.findFirst()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-6 md:px-0 mb-8">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Site Ayarları</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Şirket bilgilerini ve site ayarlarını yönetin
                </p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="px-6 md:px-0">
            <SettingsForm settings={siteSettings ? {
              id: siteSettings.id.toString(),
              companyName: siteSettings.companyName,
              companyLogo: siteSettings.companyLogo,
              description: siteSettings.description,
              themeColor: siteSettings.themeColor,
              themeFont: siteSettings.themeFont,
              darkMode: Boolean((siteSettings as { darkMode?: boolean }).darkMode),
              createdAt: siteSettings.createdAt,
              updatedAt: siteSettings.updatedAt
            } : null} />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
