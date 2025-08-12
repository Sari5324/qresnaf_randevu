import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json()

    // appointmentId can be null for homepage views

    // Get user location from headers (approximate)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')
    
    // Get real IP address
    const ip = forwarded ? forwarded.split(',')[0] : realIP || 'unknown'
    
    // Get location from IP address
    let location: string = 'Bilinmeyen'
    
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        // Use ipapi.co for geolocation (free tier: 1000 requests/day)
        const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`)
        if (locationResponse.ok) {
          const locationData = await locationResponse.json()
          if (locationData.city && locationData.country_name) {
            location = `${locationData.city}, ${locationData.country_name}`
          } else if (locationData.country_name) {
            location = locationData.country_name
          } else if (locationData.region) {
            location = locationData.region
          }
        }
      } catch (error) {
        console.error('Failed to get location:', error)
        // Fallback to simple IP display
        location = `IP: ${ip.substring(0, 10)}...`
      }
    } else {
      location = 'Yerel'
    }

    // Record the view
    await prisma.appointmentView.create({
      data: {
        appointmentId: appointmentId || null,
        location,
        ipAddress: ip !== 'unknown' ? ip : null,
        userAgent: userAgent || null,
        viewedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
