'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import UserDeleteButton from '@/components/UserDeleteButton'
import Link from 'next/link'
import { Edit2 } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setCurrentUserEmail(data.currentUserEmail || '')
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])
  
    if (isLoading) {
        return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminNav />
            <main className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </main>
            <AdminFoot />
        </div>
        )
    }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-6 md:px-0 mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Sistem kullanıcılarını yönetin
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Yeni Kullanıcı
                </Link>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="px-6 md:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-0">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">Başlamak için bir kullanıcı ekleyin.</p>
                    <div className="mt-6">
                      <Link
                        href="/admin/users/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Yeni Kullanıcı
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            E-posta
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Oluşturulma Tarihi
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'ADMIN' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm text-gray-900">
                                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  href={`/admin/users/${user.id}/edit`}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Düzenle"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                                <UserDeleteButton
                                  userId={user.id}
                                  username={user.username}
                                  currentUserEmail={currentUserEmail}
                                  userEmail={user.email}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AdminFoot />
    </div>
  )
}
