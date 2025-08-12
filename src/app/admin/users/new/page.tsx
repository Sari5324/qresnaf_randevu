import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import UserForm from '@/components/UserForm'

export default async function NewUserPage() {
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
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6 px-6 md:px-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Yeni Kullanıcı</h1>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bir kullanıcı oluşturun
              </p>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <UserForm />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
