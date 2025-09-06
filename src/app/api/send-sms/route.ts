import { NextRequest, NextResponse } from 'next/server'
import Netgsm from '@netgsm/sms'
import { prisma } from '@/lib/prisma'

interface SmsRequestBody {
  phone: string
  code: string
  customerName?: string
}

// Telefon numarası formatlama fonksiyonu
function formatPhoneNumber(phone: string): string {
  // Türkiye telefon numarası formatı için
  let cleaned = phone.replace(/\D/g, '')
  
  // Başında 0 varsa çıkar
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  
  // Başında 90 yoksa ekle (Türkiye kodu)
  if (!cleaned.startsWith('90')) {
    cleaned = '90' + cleaned
  }
  
  return cleaned
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
      return {
        success: false,
        message: 'Netgsm kullanıcı adı veya şifre ayarlanmamış. Lütfen admin panelden Netgsm bilgilerinizi girin.'
      }
    }

    const companyName = siteSettings.companyName || 'Randevu Sistemi'
    
    // Telefon numarasını formatla (Türkiye için)
    const formattedPhone = formatPhoneNumber(phone)
    
    // SMS mesajını oluştur
    const customerPrefix = customerName ? `Sayın ${customerName},` : 'Sayın müşterimiz,'
    const message = `${customerPrefix} randevunuz başarıyla oluşturulmuştur. Randevu kodunuz: ${code}. Sağlıklı günler dileriz.`
    
    console.log('📱 SMS GÖNDERİM BİLGİLERİ')
    console.log('='.repeat(50))
    console.log(`📞 Alıcı: ${formattedPhone} (Orijinal: ${phone})`)
    console.log(`👤 Müşteri: ${customerName || 'Bilinmeyen'}`)
    console.log(`🔢 Randevu Kodu: ${code}`)
    console.log(`📧 Gönderen: ${companyName}`)
    console.log(`📝 Mesaj: ${message}`)
    console.log('='.repeat(50))
    
    // Gerçek SMS gönderme işlemi
    try {
      const netgsmClient = new Netgsm({
        username: siteSettings.netgsmUsername!,
        password: siteSettings.netgsmPassword!,
        appname: 'RandevuSistemi'
      })
      
      console.log('🚀 Netgsm client oluşturuldu, SMS gönderiliyor...')
      
      const result = await netgsmClient.sendRestSms({
        msgheader: companyName.substring(0, 11), // Netgsm 11 karakter sınırı
        encoding: 'TR', // Türkçe karakter desteği
        messages: [
          {
            msg: message,
            no: formattedPhone
          }
        ]
      })
      
      console.log('📱 Netgsm API Response:', result)
      
      // Başarı kodları: 00, 20 (bazı durumlarda)
      if (result && result.code === '00') {
        console.log('✅ SMS başarıyla gönderildi!')
        return {
          success: true,
          message: `SMS başarıyla gönderildi. JobID: ${result.jobid || 'N/A'}`
        }
      } else {
        console.log('❌ SMS gönderilemedi:', result)
        return {
          success: false,
          message: `SMS gönderilemedi. Netgsm hatası: ${result?.description || 'Bilinmeyen hata'} (Kod: ${result?.code})`
        }
      }
    } catch (netgsmError: any) {
      console.error('🚨 Netgsm API hatası:', netgsmError)
      return {
        success: false,
        message: `SMS API hatası: ${netgsmError.message || netgsmError}`
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

// POST endpoint - SMS test için
export async function POST(request: NextRequest) {
  try {
    const body: SmsRequestBody = await request.json()
    const { phone, code, customerName } = body

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: 'Telefon numarası ve kod gerekli' },
        { status: 400 }
      )
    }

    const result = await sendSms(phone, code, customerName)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })
    
  } catch (error) {
    console.error('SMS API hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: `API hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` 
      },
      { status: 500 }
    )
  }
}

// GET endpoint - API durumu için
export async function GET() {
  try {
    const siteSettings = await prisma.siteSettings.findFirst()
    
    return NextResponse.json({
      message: 'SMS API çalışıyor',
      timestamp: new Date().toISOString(),
      status: {
        smsEnabled: siteSettings?.netgsmEnabled || false,
        hasCredentials: !!(siteSettings?.netgsmUsername && siteSettings?.netgsmPassword),
        companyName: siteSettings?.companyName || 'Belirtilmemiş'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'API durumu kontrol edilemedi' },
      { status: 500 }
    )
  }
}
