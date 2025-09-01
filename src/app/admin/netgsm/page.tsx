'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { ExternalLink, Smartphone, Settings, CheckCircle, AlertCircle, ArrowRight, FileText, Phone } from 'lucide-react'

interface NetgsmSettings {
  netgsmUsername: string | null
  netgsmPassword: string | null
  netgsmEnabled: boolean
  companyName: string
}

export default function NetgsmSettingsPage() {
  const [settings, setSettings] = useState<NetgsmSettings>({
    netgsmUsername: '',
    netgsmPassword: '',
    netgsmEnabled: false,
    companyName: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          netgsmUsername: data.netgsmUsername || '',
          netgsmPassword: data.netgsmPassword || '',
          netgsmEnabled: data.netgsmEnabled || false,
          companyName: data.companyName || ''
        })
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBasicSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          netgsmUsername: settings.netgsmUsername,
          netgsmPassword: settings.netgsmPassword,
          netgsmEnabled: settings.netgsmEnabled,
          companyName: settings.companyName
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Netgsm ayarları kaydedildi!' })
      } else {
        throw new Error('Kaydetme hatası')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi!' })
    } finally {
      setSaving(false)
    }
  }

  const openNetgsmPanel = () => {
    window.open('https://portal.netgsm.com.tr/', '_blank')
  }

  const openNetgsmApiDocs = () => {
    window.open('https://www.netgsm.com.tr/dokuman/', '_blank')
  }

  if (loading) {
    return (
      <AdminLayout title="Netgsm SMS Ayarları">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Netgsm SMS Ayarları">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Netgsm SMS Entegrasyonu</h1>
              <p className="text-gray-600">Randevu bildirimleri için SMS servisini yapılandırın</p>
            </div>
          </div>
        </div>

        {/* Netgsm Panel Access */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ExternalLink className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Netgsm Panel Erişimi</h2>
              <p className="text-gray-700 mb-4">
                SMS ayarlarınızı direkt Netgsm panelinden yapılandırın. Hesap bilgilerinizi kontrol edip API erişimini aktifleştirin.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={openNetgsmPanel}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  Netgsm Paneline Git
                  <ArrowRight className="h-4 w-4" />
                </button>
                
                <button
                  onClick={openNetgsmApiDocs}
                  className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  API Dokümantasyonu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Kurulum Adımları
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium text-gray-900">Netgsm Hesabınıza Giriş Yapın</h4>
                <p className="text-gray-600">Yukarıdaki "Netgsm Paneline Git" butonuna tıklayarak hesabınıza giriş yapın</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium text-gray-900">API Erişimini Kontrol Edin</h4>
                <p className="text-gray-600">Panel → Ayarlar → API Erişimi bölümünden SMS API'nin aktif olduğunu kontrol edin</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium text-gray-900">API Bilgilerinizi Alın</h4>
                <p className="text-gray-600">Kullanıcı adı ve şifrenizi (veya API key) not alın</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-medium text-gray-900">Aşağıdaki Formu Doldurun</h4>
                <p className="text-gray-600">Netgsm'den aldığınız bilgileri aşağıya girin ve kaydedin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Settings Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel SMS Ayarları</h3>
          
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle className="h-5 w-5" /> : 
                <AlertCircle className="h-5 w-5" />
              }
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Netgsm Kullanıcı Adı
              </label>
              <input
                type="text"
                value={settings.netgsmUsername || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, netgsmUsername: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Netgsm kullanıcı adınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Netgsm Şifre
              </label>
              <input
                type="password"
                value={settings.netgsmPassword || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, netgsmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Netgsm şifreniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma Adı
              </label>
              <input
                type="text"
                value={settings.companyName || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SMS'lerde görünecek firma adı"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.netgsmEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, netgsmEnabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                SMS gönderimini etkinleştir
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveBasicSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Ayarları Kaydet
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Destek Gerekli mi?</h4>
              <p className="text-yellow-700 mt-1">
                API erişimi ile ilgili sorun yaşıyorsanız Netgsm müşteri hizmetlerini arayın: 
                <strong className="ml-1">0850 200 6388</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
