import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import AdminNav from '@/components/AdminNav'
import AdminFoot from '@/components/AdminFoot'
import SliderClientPage from '@/components/SliderClientPage'
import Link from 'next/link'
import { Images } from 'lucide-react'

export const metadata = {
  title: 'Slider Yönetimi - Admin Panel',
  description: 'Slider resimlerini yönetin'
}

async function getSliderImages(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit

  const [sliderImages, totalCount] = await Promise.all([
    prisma.sliderImage.findMany({
      orderBy: { order: 'asc' },
      skip,
      take: limit
    }),
    prisma.sliderImage.count()
  ])

  return {
    sliderImages,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  }
}

export default async function SliderPage(props: {
  searchParams: Promise<{ page?: string }>
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

  const searchParams = await props.searchParams
  const currentPage = Number(searchParams.page) || 1
  const { sliderImages, totalCount } = await getSliderImages(currentPage)
  const activeImages = sliderImages.filter(img => img.isActive).length

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Slider Yönetimi</h1>
                <p className="mt-2 text-gray-600">Ana sayfa slider görsellerini yönetin</p>
              </div>
              <Link
                href="/admin/slider/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Images className="w-4 h-4" />
                Yeni Görsel Ekle
              </Link>
            </div>
          </div>

          <SliderClientPage 
            sliderImages={sliderImages}
            totalImages={totalCount}
            activeImages={activeImages}
          />
        </div>
      </div>
      <AdminFoot />
    </>
  )
}
