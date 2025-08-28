import AdminLayout from '@/components/AdminLayout'
import StaffForm from '@/components/StaffForm'

export default function NewStaff() {
  return (
    <AdminLayout
      title="Yeni Personel Ekle"
      description="Yeni personel bilgilerini ve çalışma saatlerini ekleyin"
    >
      <StaffForm />
    </AdminLayout>
  )
}
