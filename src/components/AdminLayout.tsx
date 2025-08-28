import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  className?: string
}

export default async function AdminLayout({ 
  children, 
  title, 
  description,
  maxWidth = '4xl',
  className = 'min-h-screen bg-gray-50'
}: AdminLayoutProps) {
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

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  }

  return (
    <>
      <AdminNav />
      <div className={className}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-gray-600">{description}</p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white shadow border border-gray-200 rounded-lg">
            {children}
          </div>
        </div>
      </div>
      <AdminFoot />
    </>
  )
}
