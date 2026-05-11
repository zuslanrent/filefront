import type { Department } from '@/types/regulations'

export const departments: Department[] = [
  { id: 'it', name: 'IT', nameEn: 'IT Department', canUpload: true }, // IT хэлтэс л файл оруулах эрхтэй
  { id: 'hr', name: 'Хүний нөөц', nameEn: 'Human Resources', canUpload: false },
  { id: 'finance', name: 'Санхүү', nameEn: 'Finance', canUpload: false },
  { id: 'production', name: 'Үйлдвэрлэл', nameEn: 'Production', canUpload: false },
  { id: 'quality', name: 'Чанарын хяналт', nameEn: 'Quality Control', canUpload: false },
  { id: 'safety', name: 'Аюулгүй ажиллагаа', nameEn: 'Safety', canUpload: false },
  { id: 'legal', name: 'Хууль эрх зүй', nameEn: 'Legal', canUpload: false },
  { id: 'marketing', name: 'Маркетинг', nameEn: 'Marketing', canUpload: false },
]

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id)
}

export function getDepartmentName(id: string): string {
  const dept = getDepartmentById(id)
  return dept?.name || id
}

export function getUploadDepartment(): Department | undefined {
  return departments.find(d => d.canUpload)
}
