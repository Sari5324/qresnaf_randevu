import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'

export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    // Delete records older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedRecords = await prisma.categoryView.deleteMany({
      where: {
        viewedAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    return NextResponse.json({ 
      message: 'Eski veriler başarıyla temizlendi',
      deletedCount: deletedRecords.count 
    })
  } catch (error) {
    console.error('Analytics cleanup error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Get cleanup statistics (how many records would be deleted)
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [oldRecordsCount, totalRecordsCount] = await Promise.all([
      prisma.categoryView.count({
        where: {
          viewedAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.categoryView.count()
    ])

    return NextResponse.json({
      oldRecordsCount,
      totalRecordsCount,
      keepRecordsCount: totalRecordsCount - oldRecordsCount
    })
  } catch (error) {
    console.error('Analytics cleanup info error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
