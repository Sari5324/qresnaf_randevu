import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { prisma } from '@/lib/prisma'
import UserForm from '@/components/UserForm'

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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

  // Await params in Next.js 15
  const { id } = await params

  // Admin cannot edit themselves
  if (id === session.userId) {
    redirect('/admin/users')
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!user) {
    redirect('/admin/users')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6 px-6 md:px-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Düzenle</h1>
              <p className="mt-1 text-sm text-gray-500">
                {user.username} kullanıcısının bilgilerini düzenleyin
              </p>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <UserForm user={user} />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
