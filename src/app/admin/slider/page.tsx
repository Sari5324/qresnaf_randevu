import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import SliderClientPage from '@/components/SliderClientPage'

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
    <SliderClientPage 
      sliderImages={sliderImages}
      totalImages={totalCount}
      activeImages={activeImages}
    />
  )
}
