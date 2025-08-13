import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SliderForm from '@/components/SliderForm'

export default async function NewSliderImage() {
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
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/admin/slider"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Görsel Listesine Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Görsel Ekle</h1>
            <p className="mt-2 text-gray-600">Slider için yeni görsel ekleyin</p>
          </div>

          <div className="bg-white shadow border border-gray-200 rounded-lg">
            <SliderForm />
          </div>
        </div>
      </div>
      <AdminFoot />
    </>
  )
}
