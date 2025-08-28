import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StaffForm from '@/components/StaffForm'

export default async function NewStaff() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/admin/staff"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Personel Listesine Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Personel Ekle</h1>
            <p className="mt-2 text-gray-600">Yeni personel bilgilerini ve çalışma saatlerini ekleyin</p>
          </div>

          <div className="bg-white shadow border border-gray-200 rounded-lg">
            <StaffForm />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
