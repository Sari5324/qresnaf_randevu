import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AppointmentWithStaff {
  id: string
  code: string
  customerName: string
  customerPhone: string
  date: Date
  time: string
  status: string
  notes: string | null
  staff: {
    name: string
    title: string | null
    phone: string | null
    email: string | null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const code = searchParams.get('code')
    const phone = searchParams.get('phone')

    if (!query && !code && !phone) {
      return NextResponse.json(
        { error: 'Arama parametresi gereklidir' },
        { status: 400 }
      )
    }

    let appointments: AppointmentWithStaff[] = []

    // Search by appointment code
    if (code) {
      const appointment = await prisma.appointment.findUnique({
        where: { 
          code: code.toUpperCase().trim()
        },
        include: {
          staff: {
            select: {
              name: true,
              title: true,
              phone: true,
              email: true
            }
          }
        }
      })

      if (appointment) {
        appointments = [appointment]
      }
    }
    
    // Search by phone number
    else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '') // Remove all non-digits
      
      appointments = await prisma.appointment.findMany({
        where: {
          customerPhone: {
            contains: cleanPhone
          }
        },
        include: {
          staff: {
            select: {
              name: true,
              title: true,
              phone: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 10 // Limit results
      })
    }
    
    // General search (name, phone, code)
    else if (query) {
      const searchTerm = query.trim()
      const isPhoneNumber = /^\d+$/.test(searchTerm.replace(/\D/g, ''))
      const isCode = /^[A-Z0-9]{6}$/i.test(searchTerm)

      if (isCode) {
        // Search by code
        const appointment = await prisma.appointment.findUnique({
          where: { 
            code: searchTerm.toUpperCase()
          },
          include: {
            staff: {
              select: {
                name: true,
                title: true,
                phone: true,
                email: true
              }
            }
          }
        })

        if (appointment) {
          appointments = [appointment]
        }
      } else if (isPhoneNumber) {
        // Search by phone
        const cleanPhone = searchTerm.replace(/\D/g, '')
        
        appointments = await prisma.appointment.findMany({
          where: {
            customerPhone: {
              contains: cleanPhone
            }
          },
          include: {
            staff: {
              select: {
                name: true,
                title: true,
                phone: true,
                email: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
        })
      } else {
        // Search by customer name
        appointments = await prisma.appointment.findMany({
          where: {
            customerName: {
              contains: searchTerm
            }
          },
          include: {
            staff: {
              select: {
                name: true,
                title: true,
                phone: true,
                email: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
        })
      }
    }

    return NextResponse.json({ 
      appointments,
      total: appointments.length 
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
