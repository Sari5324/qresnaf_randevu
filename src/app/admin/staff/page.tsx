import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import StaffDeleteButton from '@/components/StaffDeleteButton'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { User, Plus, Edit, Clock, Calendar, Phone, Mail } from 'lucide-react'

export default async function AdminStaff() {
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

  // Get staff with appointment counts
  const staff = await prisma.staff.findMany({
    include: {
      _count: {
        select: {
          appointments: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            }
          }
        }
      },
      workSchedule: true
    },
    orderBy: { order: 'asc' }
  })

  const totalStaff = staff.length
  const activeAppointments = staff.reduce((sum, s) => sum + s._count.appointments, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personel Yönetimi</h1>
                <p className="mt-2 text-gray-600">Personel bilgilerini ve çalışma saatlerini yönetin</p>
              </div>
              <Link
                href="/admin/staff/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Personel
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Personel</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Randevular</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAppointments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white shadow border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Personel Listesi</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktif Randevular
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışma Saatleri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            {member.title && (
                              <div className="text-sm text-gray-500">{member.title}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.phone && (
                            <div className="flex items-center mb-1">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{member.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {member._count.appointments} Randevu
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">
                              {member.workSchedule.length > 0 ? `${member.workSchedule.length} Gün` : 'Ayarlanmamış'}
                            </span>
                          </div>
                          {member.workSchedule.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-gray-400">
                                Randevu: {member.workSchedule[0]?.interval === 60 ? '1 saat' : '30 dk'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/staff/${member.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Düzenle
                          </Link>
                          <StaffDeleteButton 
                            staffId={member.id} 
                            staffName={member.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {staff.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz personel yok</h3>
                <p className="text-gray-500 mb-4">İlk personeli eklemek için aşağıdaki butona tıklayın.</p>
                <Link
                  href="/admin/staff/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Personel Ekle
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminFoot />

      {/* JavaScript for staff actions */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // Delete staff
            document.querySelectorAll('.staff-delete').forEach(button => {
              button.addEventListener('click', async function() {
                const staffId = this.dataset.id;
                const staffName = this.dataset.name;
                
                if (confirm('⚠️ ' + staffName + ' personelini silmek istediğinize emin misiniz?\\n\\nBu işlem geri alınamaz ve bu personele ait tüm randevular da silinecektir.')) {
                  try {
                    const response = await fetch('/api/staff/' + staffId, {
                      method: 'DELETE'
                    });
                    
                    if (response.ok) {
                      location.reload();
                    } else {
                      const data = await response.json();
                      alert('Hata: ' + (data.error || 'Personel silinemedi'));
                    }
                  } catch (error) {
                    alert('Bir hata oluştu: ' + error.message);
                  }
                }
              });
            });
          });
        `
      }} />
    </div>
  )
}
