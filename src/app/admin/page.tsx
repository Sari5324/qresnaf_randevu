import { cookies } from 'next/headers'
import { parseSessionToken } from '../../lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '../../components/AdminNav'
import AdminFoot from '../../components/AdminFoot'
import Link from 'next/link'
import { prisma } from '../../lib/prisma'
import { Settings, Calendar, UserCheck, Images } from 'lucide-react'

export default async function AdminDashboard() {
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

  // Get user info from database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { username: true }
  })

  if (!user) {
    redirect('/admin/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-7xl mx-auto py-6 px-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Hoşgeldin {user.username}!</h1>
            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600"/>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Randevular</h3>
                    <p className="text-gray-600 text-sm mb-4">Randevu yönetimi ve takvibi</p>
                    <Link href="/admin/appointments" className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors block text-center">
                        Görüntüle
                    </Link>
                </div>

                <div className="card bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <UserCheck className="w-6 h-6 text-purple-600"/>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Personel</h3>
                    <p className="text-gray-600 text-sm mb-4">Çalışan personel yönetimi</p>
                    <Link href="/admin/staff" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors block text-center">
                        Görüntüle
                    </Link>
                </div>

                <div className="card bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-pink-100 rounded-lg">
                            <Images className="w-6 h-6 text-pink-600"/>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Slider Görselleri</h3>
                    <p className="text-gray-600 text-sm mb-4">Ana sayfa slider yönetimi</p>
                    <Link href="/admin/slider" className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-colors block text-center">
                        Görüntüle
                    </Link>
                </div>

                <div className="card bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <Settings className="w-6 h-6 text-gray-600"/>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Site Ayarları</h3>
                    <p className="text-gray-600 text-sm mb-4">Tema ve site düzenlemeleri</p>
                    <Link href="/admin/settings" className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors block text-center">
                        Görüntüle
                    </Link>
                </div>
            </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
