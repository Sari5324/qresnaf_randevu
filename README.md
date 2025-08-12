# Sanal Menü - Virtual Menu Application

Modern ve kullanıcı dostu dijital menü sistemi. Mobil öncelikli tasarım ile restoran müşterilerine kolay menü erişimi ve yöneticilere kapsamlı yönetim paneli sunar.

## 🚀 Özellikler

### 👥 Kullanıcı Özellikleri
- **Mobil Öncelikli Tasarım** - Telefon ve tablet uyumlu arayüz
- **Anonim Erişim** - Kayıt olmadan menüye erişim
- **Kategori Bazlı Menü** - Düzenli kategori yapısı
- **Kampanya Görüntüleme** - Öne çıkan kampanyalar
- **Hızlı Yükleme** - Optimize edilmiş performans

### 👨‍💼 Yönetici Özellikleri
- **Güvenli Giriş Sistemi** - Rol tabanlı erişim kontrolü
- **Kategori Yönetimi** - Kategori ekleme, düzenleme, silme
- **Ürün Yönetimi** - Ürün ekleme, fiyatlandırma, açıklama
- **Kampanya Yönetimi** - Özel kampanyalar ve öne çıkarma
- **Analiz Sistemi** - Kategori görüntüleme istatistikleri
- **Tema Ayarları** - Renk ve stil özelleştirme
- **Site Ayarları** - Şirket bilgileri ve logo yönetimi
- **Kullanıcı Yönetimi** - Admin kullanıcı kontrolü

## 🛠️ Teknoloji Altyapısı

- **Framework**: Next.js 15 (TypeScript)
- **Veritabanı**: SQLite + Prisma ORM
- **Stil**: Tailwind CSS v4
- **Kimlik Doğrulama**: Özel cookie tabanlı session yönetimi
- **Şifreleme**: bcryptjs
- **İkonlar**: Lucide React

## 📦 Kurulum

1. **Depoyu klonlayın**
```bash
git clone https://github.com/chatillon7/qresnaf_menu.git
cd qr_esnaf_menu/workspace
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Veritabanını oluşturun**
```bash
npx prisma generate
npx prisma db push
```

4. **Başlangıç verilerini ekleyin**
```bash
npx prisma db seed
```

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🔐 Giriş Bilgileri

**Yönetici Paneli**: `/admin/login`
- **E-posta**: hizmet@qresnaf.com
- **Şifre**: admin123

## 📱 Ekran Görüntüleri

### Ana Sayfa
- Şirket logosu ve açıklaması
- Öne çıkan kampanyalar
- Kategori listesi

### Kategori Sayfası
- Kategoriye ait ürünler
- Fiyat bilgileri
- Ürün açıklamaları

### Yönetici Paneli
- Dashboard ile genel istatistikler
- Kapsamlı yönetim araçları
- Mobil uyumlu admin arayüzü

## 🏗️ Proje Yapısı

```
src/
├── app/                   # Next.js App Router
│   ├── admin/             # Yönetici paneli
│   ├── api/               # API rotaları
│   ├── category/          # Kategori sayfaları
│   ├── search/            # Arama sayfası
│   └── page.tsx           # Ana sayfa
├── components/            # Yeniden kullanılabilir bileşenler
├── lib/                   # Yardımcı kütüphaneler
│   ├── auth.ts            # Şifre hashleme
│   ├── prisma.ts          # Veritabanı istemcisi
│   └── session.ts         # Session yönetimi
└── middleware.ts          # Route koruması
```

## 🗄️ Veritabanı Şeması

- **Users**: Kullanıcı hesapları ve roller
- **Categories**: Menü kategorileri
- **Products**: Ürünler ve fiyatları
- **Campaigns**: Kampanyalar ve öne çıkarma
- **SiteSettings**: Site ayarları ve tema
- **CategoryView**: Analiz verileri

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Prisma şemasını güncelleyin (gerekirse)
2. Veritabanını migrate edin
3. Component'leri oluşturun
4. API route'larını ekleyin
5. Test edin

### Stil Değişiklikleri
- Tailwind CSS v4 kullanın
- CSS değişkenleri ile tema desteği
- Mobil öncelikli responsive tasarım

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için chatillon7 ile iletişime geçebilirsiniz.
# qresnaf_randevu
