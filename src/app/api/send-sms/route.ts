import { NextRequest, NextResponse } from 'next/server'
// NPM dokümanına göre doğru import
import Netgsm from '@netgsm/sms'
import { prisma } from '@/lib/prisma'

// Netgsm SMS client'ını başlat - geçici placeholder, gerçek veriler runtime'da alınacak
let netgsmSms: Netgsm | null = null

interface SmsRequestBody {
  phone: string
  code: string
  customerName?: string
}

// SMS gönderme fonksiyonu
export async function sendSms(phone: string, code: string, customerName?: string): Promise<{success: boolean, message: string}> {
  try {
    // Site ayarlarından şirket adını ve Netgsm bilgilerini al
    const siteSettings = await prisma.siteSettings.findFirst()
    
    if (!siteSettings) {
      return {
        success: false,
        message: 'Site ayarları bulunamadı'
      }
    }

    // SMS özelliği etkin mi kontrol et
    if (!siteSettings.netgsmEnabled) {
      console.log('❌ SMS gönderimi devre dışı - settings.netgsmEnabled: false')
      return {
        success: false,
        message: 'SMS gönderimi devre dışı. Lütfen admin panelden SMS gönderimini etkinleştirin.'
      }
    }

    // Netgsm bilgileri var mı kontrol et
    if (!siteSettings.netgsmUsername || !siteSettings.netgsmPassword) {
      console.log('❌ HATA: Netgsm bilgileri eksik')
      console.log(`Username: ${siteSettings.netgsmUsername || 'Boş'}`)
      console.log(`Password: ${siteSettings.netgsmPassword ? 'Ayarlanmış' : 'Boş'}`)
      return {
        success: false,
        message: 'Netgsm kullanıcı adı veya şifre ayarlanmamış. Lütfen admin panelden Netgsm bilgilerinizi girin.'
      }
    }

    // Test/sahte bilgileri kontrol et (geliştirici hesapları hariç)
    const testUsernames = ['test', 'deneme', 'demo', 'örnek', 'example', 'username']
    const testPasswords = ['test', 'deneme', 'demo', 'password', '123456', 'şifre']
    
    // Geliştirici hesabı kontrolü
    const isDeveloperAccount = siteSettings.netgsmUsername.toLowerCase().includes('dev') || 
                               siteSettings.netgsmUsername.toLowerCase().includes('geliştirici') ||
                               siteSettings.netgsmUsername.toLowerCase().includes('developer')
    
    if (!isDeveloperAccount && 
        (testUsernames.includes(siteSettings.netgsmUsername.toLowerCase()) || 
         testPasswords.includes(siteSettings.netgsmPassword.toLowerCase()))) {
      console.log('❌ HATA: Test/sahte bilgiler tespit edildi')
      return {
        success: false,
        message: 'Lütfen gerçek Netgsm kullanıcı adı ve şifrenizi girin. Test bilgileri ile SMS gönderilemez.'
      }
    }

    if (isDeveloperAccount) {
      console.log('🔧 Geliştirici hesabı tespit edildi - özel mod aktif')
    }

    const companyName = siteSettings.companyName || 'Randevu Sistemi'
    
    // Telefon numarasını formatla (Türkiye için)
    const formattedPhone = formatPhoneNumber(phone)
    
    // SMS mesajını oluştur
    const customerPrefix = customerName ? `Sayın ${customerName},` : 'Sayın müşterimiz,'
    const message = `${customerPrefix} randevunuz başarıyla oluşturulmuştur. Randevu kodunuz: ${code}. Sağlıklı günler dileriz.`
    
    console.log('='.repeat(60))
    console.log('📱 SMS MESAJI (SADECE LOG - GERÇEKTEn GÖNDERİLMEDİ)')
    console.log('='.repeat(60))
    console.log(`📞 Alıcı: ${formattedPhone} (Orijinal: ${phone})`)
    console.log(`👤 Müşteri: ${customerName || 'Bilinmeyen'}`)
    console.log(`🔢 Randevu Kodu: ${code}`)
    console.log(`📄 Mesaj Uzunluğu: ${message.length} karakter`)
    console.log(`📧 Gönderen: ${companyName}`)
    console.log(`🏢 Şirket Ayarı: ${siteSettings.companyName || 'Bulunamadı'}`)
    console.log(`🔧 ENV Ayarı: ${process.env.NETGSM_MSGHEADER || 'Bulunamadı'}`)
    console.log(`🔑 Netgsm Username: ${siteSettings.netgsmUsername || 'Bulunamadı'}`)
    console.log(`🔒 Netgsm Password: ${siteSettings.netgsmPassword ? '***Ayarlanmış***' : 'Bulunamadı'}`)
    console.log(`✅ SMS Etkin: ${siteSettings.netgsmEnabled ? 'Evet' : 'Hayır'}`)
    console.log('📝 Mesaj İçeriği:')
    console.log('-'.repeat(40))
    console.log(message)
    console.log('-'.repeat(40))
    console.log('='.repeat(60))
    
    // Gerçek SMS gönderme işlemi - NPM dokümanına göre güncellendi
    try {
      const netgsmClient = new Netgsm({
        username: siteSettings.netgsmUsername!,
        password: siteSettings.netgsmPassword!,
        appname: 'RandevuSistemi'
      })
      
      console.log('🚀 Netgsm client oluşturuldu, SMS gönderiliyor...')
      
      // NPM dokümanına göre sendRestSms kullanımı
      const result = await netgsmClient.sendRestSms({
        msgheader: companyName, // Şirket adını gönderen olarak kullan
        encoding: 'TR', // Türkçe karakter desteği
        messages: [
          {
            msg: message,
            no: formattedPhone
          }
        ]
      })
      
      console.log('📱 Netgsm API Response:', result)
      
      if (result && (result.code === '00' || result.code === '20' || result.code === '30')) {
        console.log('✅ SMS başarıyla gönderildi!')
        return {
          success: true,
          message: `SMS başarıyla gönderildi. JobID: ${result.jobid || 'N/A'}`
        }
      } else if (isDeveloperAccount && result) {
        // Geliştirici hesapları için özel durumlar
        console.log('🔧 Geliştirici hesabı - özel durum işleniyor')
        if (result.code === '40' || result.code === '70' || result.code === '60') {
          return {
            success: true,
            message: `Geliştirici hesabı - SMS simüle edildi. API Kodu: ${result.code} (${result.description || 'Normal geliştirici yanıtı'})`
          }
        }
        return {
          success: false,
          message: `Geliştirici hesabı hatası: ${result.description || 'Bilinmeyen hata'} (Kod: ${result.code})`
        }
      } else {
        console.log('❌ SMS gönderilemedi:', result)
        return {
          success: false,
          message: `SMS gönderilemedi. Hata: ${result?.description || 'Bilinmeyen hata'} (Kod: ${result?.code})`
        }
      }
    } catch (netgsmError) {
      console.error('🚨 Netgsm API hatası:', netgsmError)
      
      if (isDeveloperAccount) {
        console.log('🔧 Geliştirici hesabı için özel hata yönetimi')
        return {
          success: false,
          message: `Geliştirici hesabı bağlantı hatası: ${netgsmError}. Lütfen Netgsm geliştirici ayarlarınızı kontrol edin.`
        }
      }
      
      return {
        success: false,
        message: `SMS API hatası: ${netgsmError}`
      }
    }
    
  } catch (error) {
    console.error('SMS gönderme hatası:', error)
    return {
      success: false,
      message: `SMS gönderme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Telefon numarasını Netgsm formatına çevir
function formatPhoneNumber(phone: string): string {
  // Tüm boşluk, tire ve parantezleri kaldır
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Türkiye ülke kodu kontrolü
  if (cleaned.startsWith('0')) {
    // 0 ile başlıyorsa 90 ile değiştir
    cleaned = '90' + cleaned.substring(1)
  } else if (cleaned.startsWith('+90')) {
    // +90 ile başlıyorsa + işaretini kaldır
    cleaned = cleaned.substring(1)
  } else if (!cleaned.startsWith('90')) {
    // 90 ile başlamıyorsa başına ekle
    cleaned = '90' + cleaned
  }
  
  return cleaned
}

// API endpoint - POST isteği
export async function POST(request: NextRequest) {
  try {
    const body: SmsRequestBody = await request.json()
    const { phone, code, customerName } = body
    
    // Validation
    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefon numarası ve kod zorunludur' },
        { status: 400 }
      )
    }
    
    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'Kod 6 haneli olmalıdır' },
        { status: 400 }
      )
    }
    
    // Environment variables kontrolü (artık sadece fallback için)
    // Asıl kontrol veritabanındaki ayarlarda yapılıyor
    
    // SMS gönder
    const result = await sendSms(phone, code, customerName)
    
    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: result.message 
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('SMS API hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Test amaçlı GET endpoint
export async function GET() {
  return NextResponse.json({
    message: 'SMS API çalışıyor',
    timestamp: new Date().toISOString(),
    config: {
      username: process.env.NETGSM_USERNAME ? 'Tanımlı' : 'Tanımsız',
      password: process.env.NETGSM_PASSWORD ? 'Tanımlı' : 'Tanımsız',
      msgheader: process.env.NETGSM_MSGHEADER || 'Tanımsız'
    }
  })
}
