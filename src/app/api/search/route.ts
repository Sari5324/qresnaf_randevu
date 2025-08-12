import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ properties: [] })
    }

    // Türkçe karakterler için normalize edilmiş arama
    const normalizedQuery = query.trim().toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')

    // Tüm emlak ilanlarını getir ve client-side filtreleme yap
    const properties = await prisma.property.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        tags: true
      },
      orderBy: [
        { order: 'asc' },
        { title: 'asc' }
      ]
    })

    // Emlak ilanlarını filtrele
    const filteredProperties = properties.filter(property => {
      const normalizedTitle = property.title.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
      
      const normalizedDescription = (property.description || '').toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')

      const normalizedLocation = property.location.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')

      const normalizedTags = property.tags.map(tag => 
        tag.name.toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
      ).join(' ')

      const originalQuery = query.toLowerCase()

      return normalizedTitle.includes(normalizedQuery) || 
             normalizedDescription.includes(normalizedQuery) ||
             normalizedLocation.includes(normalizedQuery) ||
             normalizedTags.includes(normalizedQuery) ||
             property.title.toLowerCase().includes(originalQuery) ||
             property.description?.toLowerCase().includes(originalQuery) ||
             property.location.toLowerCase().includes(originalQuery) ||
             property.price.toString().includes(query)
    })

    return NextResponse.json({ properties: filteredProperties })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Arama yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
