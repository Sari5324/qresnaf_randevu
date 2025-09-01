'use client'

import { useState } from 'react'

export default function SmsTestPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    if (!phone || !code) {
      alert('Telefon ve kod gerekli!')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code,
          customerName: customerName || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Başarılı: ${data.message}`)
      } else {
        setResult(`❌ Hata: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Network Hatası: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    setCode(randomCode)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">SMS Test Paneli</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon Numarası
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05321234567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Randevu Kodu
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={generateRandomCode}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Üret
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Müşteri Adı (Opsiyonel)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ahmet Yılmaz"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'SMS Gönderiliyor...' : 'SMS Gönder'}
        </button>

        {result && (
          <div className={`p-3 rounded-md text-sm ${
            result.startsWith('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">Test Mesajı Önizlemesi:</h3>
        <p className="text-sm text-gray-600">
          {customerName ? `Sayın ${customerName},` : 'Sayın müşterimiz,'} randevunuz başarıyla oluşturulmuştur. 
          Randevu kodunuz: <strong>{code || 'XXXXXX'}</strong>. Sağlıklı günler dileriz.
        </p>
      </div>
    </div>
  )
}
