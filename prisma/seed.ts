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
      companyName: 'Sanal Emlak',
      description: 'Modern emlak satış platformu',
      themeColor: '#3B82F6',
      themeFont: 'inter',
      darkMode: false,
      propertyCard: true,
    },
  })

  console.log('⚙️ Created site settings:', { id: siteSettings.id, companyName: siteSettings.companyName })

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Satılık Ev',
        description: 'Satılık ev ve daire ilanları',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'Kiralık Ev',
        description: 'Kiralık ev ve daire ilanları',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: '3' },
      update: {},
      create: {
        name: 'Satılık Arsa',
        description: 'Satılık arsa ve tarla ilanları',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { id: '4' },
      update: {},
      create: {
        name: 'Ticari',
        description: 'Satılık ve kiralık ticari gayrimenkuller',
        order: 4,
      },
    }),
  ])

  console.log('📁 Created categories:', categories.map(c => c.name))

  // Create sample properties
  const properties = await Promise.all([
    // Satılık Ev
    prisma.property.upsert({
      where: { id: '1' },
      update: {},
      create: {
        title: 'Merkez\'de Satılık 3+1 Daire',
        description: 'Şehir merkezinde, metro ve otobüs duraklarına yakın, 3+1 daire. Geniş balkon, otopark ve güvenlik mevcut. Modern mutfak ve banyo, parke zemin.',
        price: 850000,
        minOfferPrice: 800000,
        location: 'Ankara/Çankaya',
        isFeatured: true,
        order: 1,
        categoryId: categories[0].id,
      },
    }),
    prisma.property.upsert({
      where: { id: '2' },
      update: {},
      create: {
        title: 'Bahçeli Villa Satılık',
        description: 'Müstakil villa, geniş bahçe, havuz, 4+1, sauna ve spor salonu mevcut. Doğa ile iç içe huzurlu yaşam.',
        price: 2500000,
        minOfferPrice: 2300000,
        location: 'İstanbul/Sarıyer',
        isFeatured: true,
        order: 2,
        categoryId: categories[0].id,
      },
    }),
    // Kiralık Ev  
    prisma.property.upsert({
      where: { id: '3' },
      update: {},
      create: {
        title: 'Kiralık 2+1 Daire',
        description: 'Yeni yapılmış, eşyalı, 2+1 daire. Tüm beyaz eşyalar dahil. Klima, çamaşır makinesi mevcut.',
        price: 8500,
        location: 'İzmir/Bornova',
        order: 1,
        categoryId: categories[1].id,
      },
    }),
    prisma.property.upsert({
      where: { id: '4' },
      update: {},
      create: {
        title: 'Deniz Manzaralı Kiralık Daire',
        description: 'Sahil kenarında, deniz manzaralı 3+1 daire. Balkon, kapalı otopark ve güvenlik mevcut.',
        price: 15000,
        location: 'Antalya/Konyaaltı',
        order: 2,
        categoryId: categories[1].id,
      },
    }),
    // Satılık Arsa
    prisma.property.upsert({
      where: { id: '5' },
      update: {},
      create: {
        title: 'İmarlı Arsa Satılık',
        description: '1000 m² imarlı arsa, konut yapımına uygun, elektrik ve su mevcut. Ana yola cepheli.',
        price: 450000,
        minOfferPrice: 400000,
        location: 'Antalya/Kepez',
        order: 1,
        categoryId: categories[2].id,
      },
    }),
    // Ticari
    prisma.property.upsert({
      where: { id: '6' },
      update: {},
      create: {
        title: 'Kiralık Dükkan',
        description: 'Ana cadde üzerinde, 50 m² dükkan. Yoğun insan trafiği. Her türlü ticarete uygun.',
        price: 15000,
        location: 'Bursa/Osmangazi',
        order: 1,
        categoryId: categories[3].id,
      },
    }),
    prisma.property.upsert({
      where: { id: '7' },
      update: {},
      create: {
        title: 'Satılık Ofis',
        description: 'İş merkezinde 120 m² ofis. Kliması, güvenliği ve otoparkı mevcut.',
        price: 680000,
        minOfferPrice: 650000,
        location: 'İstanbul/Şişli',
        order: 2,
        categoryId: categories[3].id,
      },
    }),
  ])

  console.log('� Created properties:', properties.length)

  // Create property images using actual property IDs
  await prisma.propertyImage.createMany({
    data: [
      { propertyId: properties[0].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[0].id, url: '/placeholder-campaign.jpg', order: 2 },
      { propertyId: properties[1].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[2].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[3].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[4].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[5].id, url: '/placeholder-campaign.jpg', order: 1 },
      { propertyId: properties[6].id, url: '/placeholder-campaign.jpg', order: 1 },
    ]
  })

  // Create property tags using actual property IDs
  await prisma.propertyTag.createMany({
    data: [
      // Property 1 tags
      { propertyId: properties[0].id, name: 'Merkezi Konum' },
      { propertyId: properties[0].id, name: 'Otopark' },
      { propertyId: properties[0].id, name: 'Güvenlik' },
      { propertyId: properties[0].id, name: 'Asansör' },
      // Property 2 tags
      { propertyId: properties[1].id, name: 'Villa' },
      { propertyId: properties[1].id, name: 'Bahçe' },
      { propertyId: properties[1].id, name: 'Havuz' },
      { propertyId: properties[1].id, name: 'Sauna' },
      // Property 3 tags
      { propertyId: properties[2].id, name: 'Eşyalı' },
      { propertyId: properties[2].id, name: 'Yeni Yapı' },
      { propertyId: properties[2].id, name: 'Beyaz Eşya' },
      // Property 4 tags
      { propertyId: properties[3].id, name: 'Deniz Manzarası' },
      { propertyId: properties[3].id, name: 'Balkon' },
      { propertyId: properties[3].id, name: 'Güvenlik' },
      // Property 5 tags
      { propertyId: properties[4].id, name: 'İmarlı' },
      { propertyId: properties[4].id, name: 'Elektrik' },
      { propertyId: properties[4].id, name: 'Su' },
      // Property 6 tags
      { propertyId: properties[5].id, name: 'Ana Cadde' },
      { propertyId: properties[5].id, name: 'Yoğun Trafik' },
      // Property 7 tags
      { propertyId: properties[6].id, name: 'İş Merkezi' },
      { propertyId: properties[6].id, name: 'Klima' },
      { propertyId: properties[6].id, name: 'Otopark' },
    ]
  })

  console.log('🏷️ Created property tags')

  // Create sample campaign with schedules
  const campaign = await prisma.campaign.upsert({
    where: { id: '1' },
    update: {},
    create: {
      name: 'Yaz Fırsatları',
      description: 'Yaz aylarında özel fiyatlarla emlak fırsatları! Tüm ilanlarımızda indirim.',
      image: '/placeholder-campaign.jpg',
      isActive: true,
    },
  })

  // Create campaign schedule (Pazartesi-Cuma, 09:00-18:00)
  await prisma.campaignSchedule.createMany({
    data: [
      { campaignId: campaign.id, dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Pazartesi
      { campaignId: campaign.id, dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Salı
      { campaignId: campaign.id, dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Çarşamba
      { campaignId: campaign.id, dayOfWeek: 4, startTime: '09:00', endTime: '18:00' }, // Perşembe
      { campaignId: campaign.id, dayOfWeek: 5, startTime: '09:00', endTime: '18:00' }, // Cuma
    ]
  })

  console.log('📢 Created campaign with schedule:', campaign.name)

  console.log('✅ Seed completed successfully!')
  console.log('\n📋 Login credentials:')
  console.log('Email: hizmet@qresnaf.com')
  console.log('Password: admin123')
  console.log('\n🏠 Sample properties created with images and tags')
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
