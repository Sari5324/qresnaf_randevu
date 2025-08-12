import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isFeatured } = await request.json()
    const { id } = await params
    
    const property = await prisma.property.update({
      where: { id },
      data: { isFeatured },
      include: {
        images: true,
        tags: true
      }
    })
    
    return Response.json(property)
  } catch (error) {
    console.error('Featured toggle error:', error)
    return Response.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
