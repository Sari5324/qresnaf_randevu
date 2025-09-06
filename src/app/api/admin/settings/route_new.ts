import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseSessionToken } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// GET - Site ayarlarını getir
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

    const settings = await prisma.siteSettings.findFirst()

    const response = NextResponse.json(settings)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Site ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = parseSessionToken(sessionCookie)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const { companyName, description, themeColor, themeFont, companyLogo, darkMode, businessNumber, netgsmUsername, netgsmPassword, netgsmEnabled } = await request.json()

    // Get existing settings first
    const existingSettings = await prisma.siteSettings.findFirst()

    // Validation - Only validate companyName if it's being updated
    if (companyName !== undefined) {
      if (!companyName || companyName.trim().length === 0) {
        return NextResponse.json(
          { errors: { companyName: 'Şirket adı gereklidir' } },
          { status: 400 }
        )
      }

      if (companyName.trim().length > 100) {
        return NextResponse.json(
          { errors: { companyName: 'Şirket adı 100 karakterden uzun olamaz' } },
          { status: 400 }
        )
      }
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { errors: { description: 'Açıklama 500 karakterden uzun olamaz' } },
        { status: 400 }
      )
    }

    // Validate theme color (basic hex color validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (themeColor && !hexColorRegex.test(themeColor)) {
      return NextResponse.json(
        { errors: { themeColor: 'Geçerli bir hex renk kodu girin' } },
        { status: 400 }
      )
    }

    // Validate theme font
    const validFonts = ['inter', 'grenze-gotisch', 'gluten', 'fredoka', 'newsreader', 'playwrite-us-modern', 'phudu', 'playfair', 'michroma', 'advent-pro']
    if (themeFont && !validFonts.includes(themeFont)) {
      return NextResponse.json(
        { errors: { themeFont: 'Geçerli bir font seçin' } },
        { status: 400 }
      )
    }

    let updatedSettings
    if (existingSettings) {
      // Update existing settings
      const updateData: any = {}
      
      if (companyName !== undefined) updateData.companyName = companyName.trim()
      if (description !== undefined) updateData.description = description?.trim() || null
      if (themeColor !== undefined) updateData.themeColor = themeColor || '#3B82F6'
      if (themeFont !== undefined) updateData.themeFont = themeFont || 'inter'
      if (companyLogo !== undefined) updateData.companyLogo = companyLogo?.trim() || null
      if (businessNumber !== undefined) updateData.businessNumber = businessNumber?.trim() || null
      if (typeof darkMode === 'boolean') updateData.darkMode = darkMode
      if (netgsmUsername !== undefined) updateData.netgsmUsername = netgsmUsername?.trim() || null
      if (netgsmPassword !== undefined) updateData.netgsmPassword = netgsmPassword?.trim() || null
      if (typeof netgsmEnabled === 'boolean') updateData.netgsmEnabled = netgsmEnabled

      updatedSettings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: updateData
      })
    } else {
      // Create new settings - require companyName for new records
      if (!companyName || companyName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Yeni ayar oluştururken şirket adı gereklidir' },
          { status: 400 }
        )
      }

      updatedSettings = await prisma.siteSettings.create({
        data: {
          companyName: companyName.trim(),
          description: description?.trim() || null,
          themeColor: themeColor || '#3B82F6',
          themeFont: themeFont || 'inter',
          companyLogo: companyLogo?.trim() || null,
          businessNumber: businessNumber?.trim() || null,
          darkMode: typeof darkMode === 'boolean' ? darkMode : false,
          netgsmUsername: netgsmUsername?.trim() || null,
          netgsmPassword: netgsmPassword?.trim() || null,
          netgsmEnabled: typeof netgsmEnabled === 'boolean' ? netgsmEnabled : false,
        }
      })
    }

    // Revalidate homepage to show logo changes immediately
    revalidatePath('/')
    revalidatePath('/admin/settings')

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Sunucu hatası: ' + error }, { status: 500 })
  }
}
