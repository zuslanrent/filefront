// Дэд бүлэг (Category)
export interface Category {
  id: string
  name: string
  description: string
  order: number
}

// Хэлтсийн төрөл
export interface Department {
  id: string
  name: string
  nameEn: string
  canUpload: boolean // Энэ хэлтэс файл оруулах эрхтэй эсэх
}

// Хэрэглэгчийн төрөл
export interface User {
  id: string
  name: string
  email: string
  department: string
  role: 'admin' | 'manager' | 'employee'
  avatar?: string
}

// Өмнөх хувилбар
export interface PreviousVersion {
  id: string
  version: number
  fileName: string
  fileUrl: string
  uploadedAt: Date
  uploadedBy: string
  inactivatedAt: Date
  inactivatedReason: string
}

// Дүрэм журмын файл
export interface RegulationFile {
  id: string
  name: string // Журмын нэр
  fileName: string // Файлын нэр
  fileType: string // pdf, doc, ppt, etc.
  fileSize: number // bytes
  fileUrl: string // Mock URL
  department: string // Хариуцсан хэлтэс
  category: string // Дэд бүлэг (бодлого, дүрэм, журам, заавар, гэх мэт)
  approvedDate: Date // Батлагдсан огноо
  uploadedBy: string // Хэн оруулсан (user id)
  uploadedAt: Date // Хэзээ оруулсан
  description: string // Тайлбар
  viewPermissions: string[] // Харах эрхтэй хэлтсүүд
  downloadPermissions: string[] // Татах эрхтэй хэлтсүүд
  status: 'active' | 'inactive' // Хүчинтэй эсэх
  version: number
  previousVersions: PreviousVersion[]
  inactivatedAt?: Date
  inactivatedReason?: string
  updatedAt: Date
}

// Audit log
export interface AuditLog {
  id: string
  fileId: string
  fileName: string
  userId: string
  userName: string
  userDepartment: string
  action: 'view' | 'download' | 'edit' | 'upload' | 'delete' | 'inactivate'
  timestamp: Date
  details?: string
}

// Notification
export interface Notification {
  id: string
  type: 'new_regulation' | 'update' | 'inactivate'
  title: string
  message: string
  fileId: string
  createdAt: Date
  read: boolean
  targetDepartments: string[] // Хэлтсүүд
  targetUsers?: string[] // Сонгосон ажилтнууд
  notifyAll?: boolean // Бүх ажилтнууд руу
  notifyEmail?: string // Групп имэйл хаяг
}

// Email notification тохиргоо
export interface NotificationSettings {
  userId: string
  emailOnNewRegulation: boolean
  emailOnUpdate: boolean
  emailOnInactivate: boolean
  departments: string[] // Аль хэлтсүүдийн мэдэгдэл авах
}

// Upload form data
export interface UploadFormData {
  name: string
  department: string
  approvedDate: Date
  description: string
  viewPermissions: string[]
  downloadPermissions: string[]
  files: File[]
}

// Filter options
export interface FilterOptions {
  search: string
  department: string
  category: string
  status: 'all' | 'active' | 'inactive'
  sortBy: 'newest' | 'oldest' | 'name' | 'updated'
  dateFrom?: Date
  dateTo?: Date
}
