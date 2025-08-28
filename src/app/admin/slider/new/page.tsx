import AdminLayout from '@/components/AdminLayout'
import SliderForm from '@/components/SliderForm'

export default function NewSliderImage() {
  return (
    <AdminLayout
      title="Yeni Görsel Ekle"
      description="Slider için yeni görsel ekleyin"
    >
      <SliderForm />
    </AdminLayout>
  )
}
