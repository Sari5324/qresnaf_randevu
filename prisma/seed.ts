import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'hizmet@qresnaf.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'hizmet@qresnaf.com',
      password: hashedPassword,
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
    },
  })

  console.log('⚙️ Created site settings:', { id: siteSettings.id, companyName: siteSettings.companyName })

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.upsert({
      where: { id: '1' },
      update: {},
      create: {
        title: 'Satılık Müstakil Ev',
        description: 'Bahçeli, üç katlı müstakil ev. Merkezi konumda, ulaşım kolay.',
        price: 850000,
        minOfferPrice: 750000,
        location: 'İstanbul/Kadıköy',
        order: 1,
        isFeatured: true,
      },
    }),
    prisma.property.upsert({
      where: { id: '2' },
      update: {},
      create: {
        title: 'Satılık Villa',
        description: 'Deniz manzaralı, havuzlu villa. Lüks yaşam alanları.',
        price: 2500000,
        location: 'Antalya/Kaş',
        order: 2,
      },
    }),
    prisma.property.upsert({
      where: { id: '3' },
      update: {},
      create: {
        title: 'Kiralık 2+1 Daire',
        description: 'Yeni yapılmış, eşyalı, 2+1 daire. Tüm beyaz eşyalar dahil. Klima, çamaşır makinesi mevcut.',
        price: 8500,
        location: 'İzmir/Bornova',
        order: 3,
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
        order: 4,
      },
    }),
    prisma.property.upsert({
      where: { id: '5' },
      update: {},
      create: {
        title: 'İmarlı Arsa Satılık',
        description: '1000 m² imarlı arsa, konut yapımına uygun, elektrik ve su mevcut. Ana yola cepheli.',
        price: 450000,
        minOfferPrice: 400000,
        location: 'Antalya/Kepez',
        order: 5,
      },
    }),
  ])

  console.log('🏠 Created properties:', properties.map(p => p.title))

  // Create property tags with icons
  await prisma.propertyTag.createMany({
    data: [
      // Property 1 tags
      { propertyId: properties[0].id, name: 'Merkezi Konum', icon: 'MapPin' },
      { propertyId: properties[0].id, name: 'Otopark', icon: 'Car' },
      { propertyId: properties[0].id, name: 'Güvenlik', icon: 'Shield' },
      { propertyId: properties[0].id, name: 'Asansör', icon: 'ArrowUpDown' },
      // Property 2 tags
      { propertyId: properties[1].id, name: 'Villa', icon: 'Home' },
      { propertyId: properties[1].id, name: 'Bahçe', icon: 'Trees' },
      { propertyId: properties[1].id, name: 'Havuz', icon: 'Waves' },
      { propertyId: properties[1].id, name: 'Deniz Manzarası', icon: 'Eye' },
      // Property 3 tags
      { propertyId: properties[2].id, name: 'Eşyalı', icon: 'Sofa' },
      { propertyId: properties[2].id, name: 'Yeni Yapı', icon: 'Sparkles' },
      { propertyId: properties[2].id, name: 'Beyaz Eşya', icon: 'Refrigerator' },
      // Property 4 tags
      { propertyId: properties[3].id, name: 'Deniz Manzarası', icon: 'Eye' },
      { propertyId: properties[3].id, name: 'Balkon', icon: 'Building2' },
      { propertyId: properties[3].id, name: 'Güvenlik', icon: 'Shield' },
      // Property 5 tags
      { propertyId: properties[4].id, name: 'İmarlı', icon: 'FileCheck' },
      { propertyId: properties[4].id, name: 'Elektrik', icon: 'Zap' },
      { propertyId: properties[4].id, name: 'Su', icon: 'Droplets' },
    ]
  })

  console.log('🏷️ Created property tags with icons')

  console.log('✅ Seed completed successfully!')
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
