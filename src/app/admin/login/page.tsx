import LoginForm from '@/components/LoginForm'
import AdminFoot from '@/components/AdminFoot'
import Image from 'next/image'

export default async function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex flex-col justify-center py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <Image src="/logo.png" alt="Logo" className="mb-4" width={144} height={144} priority/>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Yönetici Girişi</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sanal Randevu yönetim paneline erişim
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
      <AdminFoot />
    </div>
  )
}
