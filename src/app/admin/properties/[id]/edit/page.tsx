import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import { prisma } from '@/lib/prisma'
import PropertyForm from '@/components/PropertyForm'
import { parseSessionToken } from '@/lib/session'

export default async function EditPropertyPage({ 
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

  // Get property
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      tags: true
    }
  })

  if (!property) {
    redirect('/admin/properties')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6 px-6 md:px-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">İlan Düzenle</h1>
              <p className="mt-1 text-sm text-gray-500">
                {property.title} ilanını düzenleyin
              </p>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <PropertyForm property={property} />
          </div>
        </div>
      </main>
      <AdminFoot />
    </div>
  )
}
