'use client'

import Link from 'next/link'

export default function AdminFoot() {

  return (
    <footer className="bg-gray-300 border-t border-gray-400/40">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <p className="text-gray-600 text-sm">
                            QR EsnaF © 2025. Tüm hakları saklıdır.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        <Link href="mailto:hizmet@qresnaf.com" className="text-gray-600 hover:text-gray-900 text-sm">
                            Bize Ulaşın
                        </Link>
                    </div>
                </div>
            </div>
    </footer>
  )
}
