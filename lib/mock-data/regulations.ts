import type { RegulationFile, AuditLog, Notification } from '@/types/regulations'

// Mock regulations data
export const initialRegulations: RegulationFile[] = [
  {
    id: 'reg1',
    name: 'Ажилтны ёс зүйн дүрэм',
    fileName: 'ajiltny-yos-zuiin-durem.pdf',
    fileType: 'pdf',
    fileSize: 2457600, // 2.4MB
    fileUrl: '/mock-files/ajiltny-yos-zuiin-durem.pdf',
    department: 'hr',
    category: 'rule',
    approvedDate: new Date('2024-01-15'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-20'),
    description: 'Байгууллагын ажилтнуудын дагаж мөрдөх ёс зүйн дүрэм',
    viewPermissions: ['it', 'hr', 'finance', 'production', 'quality', 'safety', 'legal', 'marketing'],
    downloadPermissions: ['it', 'hr', 'finance', 'production', 'quality', 'safety', 'legal', 'marketing'],
    status: 'active',
    version: 2,
    previousVersions: [
      {
        id: 'reg1-v1',
        version: 1,
        fileName: 'ajiltny-yos-zuiin-durem-v1.pdf',
        fileUrl: '/mock-files/ajiltny-yos-zuiin-durem-v1.pdf',
        uploadedAt: new Date('2023-06-10'),
        uploadedBy: 'user1',
        inactivatedAt: new Date('2024-01-20'),
        inactivatedReason: 'Шинэ хувилбар батлагдсан',
      },
    ],
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'reg2',
    name: 'Мэдээллийн аюулгүй байдлын бодлого',
    fileName: 'medeelliin-ayuulgui-baidlyn-bodlogo.pdf',
    fileType: 'pdf',
    fileSize: 1843200, // 1.8MB
    fileUrl: '/mock-files/medeelliin-ayuulgui-baidlyn-bodlogo.pdf',
    department: 'it',
    category: 'policy',
    approvedDate: new Date('2024-03-01'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-03-05'),
    description: 'Байгууллагын мэдээллийн системийн аюулгүй байдлыг хангах бодлого',
    viewPermissions: ['it', 'hr', 'finance', 'production', 'quality', 'safety', 'legal', 'marketing'],
    downloadPermissions: ['it'],
    status: 'active',
    version: 1,
    previousVersions: [],
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'reg3',
    name: 'Санхүүгийн тайлагналын журам',
    fileName: 'sanhuugiin-tailagnaliin-juram.docx',
    fileType: 'docx',
    fileSize: 512000, // 500KB
    fileUrl: '/mock-files/sanhuugiin-tailagnaliin-juram.docx',
    department: 'finance',
    category: 'regulation',
    approvedDate: new Date('2024-02-10'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-02-15'),
    description: 'Санхүүгийн тайлан гаргах, хянах журам',
    viewPermissions: ['it', 'finance', 'legal'],
    downloadPermissions: ['it', 'finance'],
    status: 'active',
    version: 1,
    previousVersions: [],
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'reg4',
    name: 'Үйлдвэрлэлийн аюулгүй ажиллагааны дүрэм',
    fileName: 'uildverlelin-ayuulgui-ajillagaany-durem.pdf',
    fileType: 'pdf',
    fileSize: 3686400, // 3.5MB
    fileUrl: '/mock-files/uildverlelin-ayuulgui-ajillagaany-durem.pdf',
    department: 'safety',
    category: 'rule',
    approvedDate: new Date('2024-04-01'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-04-05'),
    description: 'Үйлдвэрлэлийн талбайд ажиллах аюулгүй ажиллагааны дүрэм',
    viewPermissions: ['it', 'production', 'safety', 'quality'],
    downloadPermissions: ['it', 'production', 'safety'],
    status: 'active',
    version: 1,
    previousVersions: [],
    updatedAt: new Date('2024-04-05'),
  },
  {
    id: 'reg5',
    name: 'Чанарын хяналтын журам',
    fileName: 'chanaryn-hyanaltyn-juram.pptx',
    fileType: 'pptx',
    fileSize: 5242880, // 5MB
    fileUrl: '/mock-files/chanaryn-hyanaltyn-juram.pptx',
    department: 'quality',
    category: 'regulation',
    approvedDate: new Date('2023-12-01'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2023-12-10'),
    description: 'Бүтээгдэхүүний чанарыг хянах журам',
    viewPermissions: ['it', 'production', 'quality'],
    downloadPermissions: ['it', 'quality'],
    status: 'inactive',
    version: 1,
    previousVersions: [],
    inactivatedAt: new Date('2024-05-01'),
    inactivatedReason: 'Шинэ ISO стандарт нэвтрүүлж байгаа тул түр хүчингүй болгов',
    updatedAt: new Date('2024-05-01'),
  },
  {
    id: 'reg6',
    name: 'Ажилд орох, гарах журам',
    fileName: 'ajild-oroh-garah-juram.pdf',
    fileType: 'pdf',
    fileSize: 1024000, // 1MB
    fileUrl: '/mock-files/ajild-oroh-garah-juram.pdf',
    department: 'hr',
    category: 'regulation',
    approvedDate: new Date('2024-05-15'),
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-05-20'),
    description: 'Ажилтан авах, чөлөөлөх үйл ажиллагааны журам',
    viewPermissions: ['it', 'hr', 'legal'],
    downloadPermissions: ['it', 'hr'],
    status: 'active',
    version: 1,
    previousVersions: [],
    updatedAt: new Date('2024-05-20'),
  },
]

// Mock audit logs
export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    fileId: 'reg1',
    fileName: 'Ажилтны ёс зүйн дүрэм',
    userId: 'user2',
    userName: 'Батболд Дорж',
    userDepartment: 'hr',
    action: 'view',
    timestamp: new Date('2024-05-10T09:30:00'),
  },
  {
    id: 'log2',
    fileId: 'reg1',
    fileName: 'Ажилтны ёс зүйн дүрэм',
    userId: 'user3',
    userName: 'Сарантуяа Ганболд',
    userDepartment: 'finance',
    action: 'download',
    timestamp: new Date('2024-05-10T10:15:00'),
  },
  {
    id: 'log3',
    fileId: 'reg2',
    fileName: 'Мэдээллийн аюулгүй байдлын бодлого',
    userId: 'user1',
    userName: 'Админ Супер',
    userDepartment: 'it',
    action: 'upload',
    timestamp: new Date('2024-03-05T14:00:00'),
    details: 'Шинэ журам нэмэгдлээ',
  },
  {
    id: 'log4',
    fileId: 'reg5',
    fileName: 'Чанарын хяналтын журам',
    userId: 'user1',
    userName: 'Админ Супер',
    userDepartment: 'it',
    action: 'inactivate',
    timestamp: new Date('2024-05-01T11:00:00'),
    details: 'Шинэ ISO стандарт нэвтрүүлж байгаа тул түр хүчингүй болгов',
  },
  {
    id: 'log5',
    fileId: 'reg4',
    fileName: 'Үйлдвэрлэлийн аюулгүй ажиллагааны дүрэм',
    userId: 'user4',
    userName: 'Энхбаяр Түвшин',
    userDepartment: 'production',
    action: 'view',
    timestamp: new Date('2024-05-12T08:45:00'),
  },
  {
    id: 'log6',
    fileId: 'reg4',
    fileName: 'Үйлдвэрлэлийн аюулгүй ажиллагааны дүрэм',
    userId: 'user4',
    userName: 'Энхбаяр Түвшин',
    userDepartment: 'production',
    action: 'download',
    timestamp: new Date('2024-05-12T08:50:00'),
  },
]

// Mock notifications
export const initialNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'new_regulation',
    title: 'Шинэ журам нэмэгдлээ',
    message: 'Ажилд орох, гарах журам шинээр нэмэгдлээ',
    fileId: 'reg6',
    createdAt: new Date('2024-05-20T10:00:00'),
    read: false,
    targetDepartments: ['it', 'hr', 'legal'],
  },
  {
    id: 'notif2',
    type: 'inactivate',
    title: 'Журам хүчингүй боллоо',
    message: 'Чанарын хяналтын журам түр хүчингүй болгогдлоо',
    fileId: 'reg5',
    createdAt: new Date('2024-05-01T11:00:00'),
    read: true,
    targetDepartments: ['it', 'production', 'quality'],
  },
]

// LocalStorage keys
const REGULATIONS_KEY = 'regulations_data'
const AUDIT_LOGS_KEY = 'regulations_audit_logs'
const NOTIFICATIONS_KEY = 'regulations_notifications'

// Storage functions
export function getRegulations(): RegulationFile[] {
  if (typeof window === 'undefined') return initialRegulations
  const stored = localStorage.getItem(REGULATIONS_KEY)
  if (!stored) {
    localStorage.setItem(REGULATIONS_KEY, JSON.stringify(initialRegulations))
    return initialRegulations
  }
  return JSON.parse(stored, dateReviver)
}

export function saveRegulations(regulations: RegulationFile[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REGULATIONS_KEY, JSON.stringify(regulations))
}

export function addRegulation(regulation: RegulationFile): void {
  const regulations = getRegulations()
  regulations.unshift(regulation)
  saveRegulations(regulations)
}

export function updateRegulation(id: string, updates: Partial<RegulationFile>): void {
  const regulations = getRegulations()
  const index = regulations.findIndex(r => r.id === id)
  if (index !== -1) {
    regulations[index] = { ...regulations[index], ...updates, updatedAt: new Date() }
    saveRegulations(regulations)
  }
}

export function getRegulationById(id: string): RegulationFile | undefined {
  const regulations = getRegulations()
  return regulations.find(r => r.id === id)
}

// Audit log functions
export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return initialAuditLogs
  const stored = localStorage.getItem(AUDIT_LOGS_KEY)
  if (!stored) {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(initialAuditLogs))
    return initialAuditLogs
  }
  return JSON.parse(stored, dateReviver)
}

export function saveAuditLogs(logs: AuditLog[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs))
}

export function addAuditLog(log: Omit<AuditLog, 'id'>): void {
  const logs = getAuditLogs()
  const newLog: AuditLog = {
    ...log,
    id: `log${Date.now()}`,
  }
  logs.unshift(newLog)
  saveAuditLogs(logs)
}

// Notification functions
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return initialNotifications
  const stored = localStorage.getItem(NOTIFICATIONS_KEY)
  if (!stored) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications))
    return initialNotifications
  }
  return JSON.parse(stored, dateReviver)
}

export function addNotification(notification: Omit<Notification, 'id'>): void {
  if (typeof window === 'undefined') return
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: `notif${Date.now()}`,
  }
  notifications.unshift(newNotification)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

// Date reviver for JSON.parse
function dateReviver(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    if (dateRegex.test(value)) {
      return new Date(value)
    }
  }
  return value
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File type icon helper
export function getFileTypeIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pdf: 'FileText',
    doc: 'FileText',
    docx: 'FileText',
    xls: 'FileSpreadsheet',
    xlsx: 'FileSpreadsheet',
    ppt: 'Presentation',
    pptx: 'Presentation',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
  }
  return icons[fileType.toLowerCase()] || 'File'
}
