import { NextRequest, NextResponse } from 'next/server'
import Netgsm, { BalanceType } from '@netgsm/sms'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        valid: false,
        message: 'Kullanıcı adı ve şifre gerekli'
      }, { status: 400 })
    }

    console.log('🔍 Netgsm hesabı gerçek API ile doğrulanıyor...')
    console.log(`👤 Username: ${username}`)
    
    try {
      // Direkt Netgsm API ile gerçek hesap kontrolü - hiç sahte kontrol yapmıyoruz
      const netgsmClient = new Netgsm({
        username: username,
        password: password,
        appname: 'RandevuSistemi'
      })

      // Önce balance API ile test
      console.log('🏦 Balance API ile hesap kontrolü...')
      try {
        const balanceResult = await netgsmClient.checkBalance({
          stip: BalanceType.CREDIT
        })
        
        console.log('💰 Netgsm Balance API Yanıtı:', balanceResult)

        // Kod analizi - Netgsm API dokümanına göre
        if (balanceResult && balanceResult.code === '00') {
          // Başarılı - hesap geçerli ve API erişimi var
          console.log('✅ Netgsm hesabı tam erişimli!')
          return NextResponse.json({
            valid: true,
            message: `Netgsm hesabı doğrulandı! API erişimi aktif. Bakiye: ${balanceResult.balance || 'Bilgi alınamadı'}`,
            isDeveloper: false,
            balance: balanceResult.balance || 0
          })
        } else {
          // Tüm diğer kodlar başarısız - Balance API'den SMS API'ye geç
          console.log('❌ Balance API hatası:', balanceResult?.code, '- SMS API deneniyor...')
        }
      } catch (balanceError: any) {
        console.log('⚠️ Balance API hatası, SMS API testi deneniyor...')
        console.log('Balance Error:', balanceError)
      }

      // Balance başarısız, SMS API ile test et
      console.log('📱 SMS API ile hesap kontrolü...')
      try {
        // Geliştirici hesabı için özel test - gerçek numara formatı ama test mesajı
        const smsResult = await netgsmClient.sendRestSms({
          msgheader: 'TEST', 
          encoding: 'TR',
          messages: [
            {
              msg: 'API dogrulama testi', 
              no: '905001234567' // Daha gerçekçi test numarası
            }
          ]
        })
        
        console.log('📡 Netgsm SMS API Yanıtı:', smsResult)

        // SMS API kod analizi - SADECE BAŞARILI KODLAR KABUL EDİLİR
        if (smsResult && smsResult.code === '00') {
          // Başarılı SMS API erişimi
          console.log('✅ SMS API erişimi başarılı!')
          return NextResponse.json({
            valid: true,
            message: 'Netgsm hesabı doğrulandı! SMS API erişimi aktif.',
            isDeveloper: false,
            apiCode: smsResult.code
          })
        } else {
          // Tüm diğer kodlar başarısız - Netgsm API ne diyorsa o
          console.log('❌ SMS API hatası - Netgsm yanıtı:', smsResult?.code)
          return NextResponse.json({
            valid: false,
            message: `Netgsm API hatası (Kod: ${smsResult?.code}) - Hesap bilgileri geçersiz`
          }, { status: 401 })
        }
      } catch (smsError: any) {
        console.error('🚨 SMS API Exception:', smsError)
        
        // Netgsm paketi error fırlatıyor ama aslında normal response
        // Error objesinde code ve description var
        if (smsError.code) {
          console.log('📝 Error objesindeki kod:', smsError.code)
          if (smsError.code === '00') {
            // Başarılı ama exception olarak geldi
            return NextResponse.json({
              valid: true,
              message: 'Netgsm hesabı doğrulandı!'
            })
          } else {
            // Hatalı credentials - code 30, 01, 02 vs.
            return NextResponse.json({
              valid: false,
              message: `Netgsm hesap bilgileri hatalı: ${smsError.description || 'Kod: ' + smsError.code}`
            }, { status: 401 })
          }
        }
        
        // Gerçek connection hatası
        return NextResponse.json({
          valid: false,
          message: `Netgsm bağlantı hatası: ${smsError.message || 'Bilinmeyen hata'}`
        }, { status: 500 })
      }
    } catch (netgsmError: any) {
      console.error('🚨 Netgsm API bağlantı hatası:', netgsmError)
      
      // Hata türüne göre mesaj
      if (netgsmError.message?.includes('401') || netgsmError.message?.includes('Unauthorized')) {
        return NextResponse.json({
          valid: false,
          message: 'Netgsm kullanıcı adı veya şifre hatalı!'
        }, { status: 401 })
      } else if (netgsmError.message?.includes('timeout') || netgsmError.message?.includes('network')) {
        return NextResponse.json({
          valid: false,
          message: 'Netgsm sunucusuna bağlanılamıyor. Lütfen daha sonra tekrar deneyin.'
        }, { status: 503 })
      } else {
        return NextResponse.json({
          valid: false,
          message: `Netgsm bağlantı hatası: ${netgsmError.message || 'Bilinmeyen hata'}`
        }, { status: 500 })
      }
    }

  } catch (error: any) {
    console.error('🚨 Validation API hatası:', error)
    return NextResponse.json({
      valid: false,
      message: 'Doğrulama sırasında hata oluştu: ' + error.message
    }, { status: 500 })
  }
}
