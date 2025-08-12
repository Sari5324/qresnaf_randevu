import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import SliderImageWithFallback from '@/components/SliderImageWithFallback'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Images, Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

export default async function AdminSlider() {
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

  // Get slider images
  const sliderImages = await prisma.sliderImage.findMany({
    orderBy: { order: 'asc' }
  })

  const totalImages = sliderImages.length
  const activeImages = sliderImages.filter(img => img.isActive).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="main-content flex-grow bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Çalışma Görselleri</h1>
                <p className="mt-2 text-gray-600">Ana sayfa slider görsellerini yönetin</p>
              </div>
              <Link
                href="/admin/slider/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Görsel
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Images className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Görsel</p>
                  <p className="text-2xl font-bold text-gray-900">{totalImages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Görsel</p>
                  <p className="text-2xl font-bold text-gray-900">{activeImages}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Images Table */}
          <div className="bg-white shadow border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Görsel Listesi</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görsel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sliderImages.map((image, index) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{image.order}</span>
                          <div className="flex flex-col space-y-1">
                            {index > 0 && (
                              <button 
                                className="text-gray-400 hover:text-gray-600 slider-move-up"
                                data-id={image.id}
                                title="Yukarı taşı"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            )}
                            {index < sliderImages.length - 1 && (
                              <button 
                                className="text-gray-400 hover:text-gray-600 slider-move-down"
                                data-id={image.id}
                                title="Aşağı taşı"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-24">
                          <SliderImageWithFallback
                            className="h-16 w-24 object-cover rounded border border-gray-200" 
                            src={image.url} 
                            alt={image.name}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{image.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {image.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          image.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {image.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 slider-toggle"
                            data-id={image.id}
                            data-active={image.isActive}
                            title={image.isActive ? 'Pasif yap' : 'Aktif yap'}
                          >
                            {image.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link
                            href={`/admin/slider/${image.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            className="text-red-600 hover:text-red-900 slider-delete"
                            data-id={image.id}
                            data-name={image.name}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sliderImages.length === 0 && (
              <div className="text-center py-12">
                <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz görsel yok</h3>
                <p className="text-gray-500 mb-4">İlk görseli eklemek için aşağıdaki butona tıklayın.</p>
                <Link
                  href="/admin/slider/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Görsel Ekle
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminFoot />

      {/* JavaScript for slider actions */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // Toggle active/inactive
            document.querySelectorAll('.slider-toggle').forEach(button => {
              button.addEventListener('click', async function() {
                const imageId = this.dataset.id;
                const isActive = this.dataset.active === 'true';
                
                try {
                  const response = await fetch('/api/admin/slider/' + imageId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !isActive })
                  });
                  
                  if (response.ok) {
                    location.reload();
                  } else {
                    alert('Durum değiştirilemedi');
                  }
                } catch (error) {
                  alert('Bir hata oluştu');
                }
              });
            });

            // Delete image
            document.querySelectorAll('.slider-delete').forEach(button => {
              button.addEventListener('click', async function() {
                const imageId = this.dataset.id;
                const imageName = this.dataset.name;
                
                if (confirm('⚠️ ' + imageName + ' görselini silmek istediğinize emin misiniz?\\n\\nBu işlem geri alınamaz.')) {
                  try {
                    const response = await fetch('/api/admin/slider/' + imageId, {
                      method: 'DELETE'
                    });
                    
                    if (response.ok) {
                      location.reload();
                    } else {
                      const data = await response.json();
                      alert('Hata: ' + (data.error || 'Görsel silinemedi'));
                    }
                  } catch (error) {
                    alert('Bir hata oluştu');
                  }
                }
              });
            });

            // Move up/down
            document.querySelectorAll('.slider-move-up, .slider-move-down').forEach(button => {
              button.addEventListener('click', async function() {
                const imageId = this.dataset.id;
                const direction = this.classList.contains('slider-move-up') ? 'up' : 'down';
                
                try {
                  const response = await fetch('/api/admin/slider/' + imageId + '/move', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ direction })
                  });
                  
                  if (response.ok) {
                    location.reload();
                  } else {
                    alert('Sıralama değiştirilemedi');
                  }
                } catch (error) {
                  alert('Bir hata oluştu');
                }
              });
            });
          });
        `
      }} />
    </div>
  )
}
