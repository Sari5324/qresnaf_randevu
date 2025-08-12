import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create default admin user
  const adminPassword = await hashPassword('admin123')
  
  const admin = await prisma.user.upsert({
    where: { email: 'hizmet@qresnaf.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'hizmet@qresnaf.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('👤 Created admin user:', { id: admin.id, email: admin.email })

  // Create default site settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      companyName: 'Sanal Randevu',
      description: 'Modern randevu yönetim sistemi',
      themeColor: '#3B82F6',
      themeFont: 'inter',
      darkMode: false,
    },
  })

  console.log('⚙️ Created site settings:', { id: siteSettings.id, companyName: siteSettings.companyName })

  // Create sample staff members
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Dr. Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 532 123 4567',
        title: 'Uzman Doktor',
        order: 1,
      },
    }),
    prisma.staff.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'Dr. Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+90 532 234 5678',
        title: 'Uzman Doktor',
        order: 2,
      },
    }),
    prisma.staff.upsert({
      where: { id: '3' },
      update: {},
      create: {
        name: 'Hemşire Fatma Demir',
        email: 'fatma@example.com',
        phone: '+90 532 345 6789',
        title: 'Hemşire',
        order: 3,
      },
    }),
  ])

  console.log('👥 Created staff members:', staff.map(s => s.name))

  // Create work schedules for staff
  const workSchedules = []
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  
  for (const staffMember of staff) {
    for (let i = 0; i < days.length; i++) {
      const dayOfWeek = days[i]
      const isWeekend = dayOfWeek === 'SATURDAY' || dayOfWeek === 'SUNDAY'
      
      const schedule = await prisma.workSchedule.upsert({
        where: { 
          staffId_dayOfWeek: { 
            staffId: staffMember.id, 
            dayOfWeek: dayOfWeek as any 
          } 
        },
        update: {},
        create: {
          staffId: staffMember.id,
          dayOfWeek: dayOfWeek as any,
          isWorking: !isWeekend,
          startTime: !isWeekend ? '09:00' : null,
          endTime: !isWeekend ? '17:00' : null,
          interval: !isWeekend ? 30 : null,
          breakStart: !isWeekend ? '12:00' : null,
          breakEnd: !isWeekend ? '13:00' : null,
        },
      })
      workSchedules.push(schedule)
    }
  }

  console.log('📅 Created work schedules:', workSchedules.length)

  // Create slider images
  const sliderImages = await Promise.all([
    prisma.sliderImage.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Hoş Geldiniz',
        url: '/placeholder-campaign.jpg',
        description: 'Modern sağlık hizmetleri için randevu alın',
        order: 1,
        isActive: true,
      },
    }),
    prisma.sliderImage.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'Uzman Kadro',
        url: '/placeholder-campaign.jpg',
        description: 'Deneyimli doktor ve hemşirelerimizle hizmetinizdeyiz',
        order: 2,
        isActive: true,
      },
    }),
    prisma.sliderImage.upsert({
      where: { id: '3' },
      update: {},
      create: {
        name: 'Kolay Randevu',
        url: '/placeholder-campaign.jpg',
        description: 'Kolayca randevu alın, zamanınızı verimli kullanın',
        order: 3,
        isActive: true,
      },
    }),
  ])

  console.log('🖼️ Created slider images:', sliderImages.length)

  // Generate random appointment code
  function generateAppointmentCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Create sample appointments
  const appointments = await Promise.all([
    prisma.appointment.upsert({
      where: { id: '1' },
      update: {},
      create: {
        code: generateAppointmentCode(),
        customerName: 'Mehmet Özkan',
        customerPhone: '+90 532 111 2233',
        staffId: staff[0].id,
        date: new Date('2024-01-15T00:00:00.000Z'),
        time: '10:00',
        status: 'CONFIRMED',
        notes: 'Kontrol randevusu',
      },
    }),
    prisma.appointment.upsert({
      where: { id: '2' },
      update: {},
      create: {
        code: generateAppointmentCode(),
        customerName: 'Zeynep Yıldız',
        customerPhone: '+90 532 222 3344',
        staffId: staff[1].id,
        date: new Date('2024-01-16T00:00:00.000Z'),
        time: '14:30',
        status: 'PENDING',
        notes: 'İlk muayene',
      },
    }),
  ])

  console.log('📋 Created sample appointments:', appointments.length)

  console.log('✅ Seed completed successfully!')
  console.log('\n📋 Login credentials:')
  console.log('Email: hizmet@qresnaf.com')
  console.log('Password: admin123')
  console.log('\n👥 Sample staff and appointments created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })