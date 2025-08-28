import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'

export default async function AdminAnalytics() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Analitik</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500">Analitik sayfası geliştirme aşamasında...</p>
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}