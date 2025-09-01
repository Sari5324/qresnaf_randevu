'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  className?: string
}

export default function AdminLayout({ 
  children, 
  title, 
  description,
  maxWidth = '4xl',
  className = 'min-h-screen bg-gray-50'
}: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        
        const data = await response.json()
        if (!data.authenticated || data.user?.role !== 'ADMIN') {
          router.push('/admin/login')
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
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
