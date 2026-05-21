// lib/storage.ts
"use client"

// Төрлүүдийг шууд энд тодорхойлсон
interface SubCategory {
  id: string
  name: string
  parentId: string
}

interface Category {
  id: string
  name: string
  description?: string
  subCategories: SubCategory[]
  createdAt: Date
}

interface ErrorRecord {
  id: string
  keyword: string
  description: string
  solution: string
  images: string[]
  categoryId: string
  subCategoryId?: string
  department: string
  status: "active" | "inactive"
  updatedAt: Date
  createdAt: Date
}

const defaultCategories: Category[] = [
  { 
    id: "1", 
    name: "Business Central", 
    description: "Microsoft Dynamics Business Central", 
    subCategories: [
      { id: "1-1", name: "Нэвтрэх", parentId: "1" },
      { id: "1-2", name: "Тайлан", parentId: "1" },
      { id: "1-3", name: "Интеграци", parentId: "1" },
    ],
    createdAt: new Date() 
  },
  { 
    id: "2", 
    name: "Green ERP", 
    description: "Green ERP систем", 
    subCategories: [
      { id: "2-1", name: "Санхүү", parentId: "2" },
      { id: "2-2", name: "Агуулах", parentId: "2" },
    ],
    createdAt: new Date() 
  },
  { 
    id: "3", 
    name: "Albe Soft", 
    description: "Albe Soft програм хангамж", 
    subCategories: [
      { id: "3-1", name: "Хэвлэх", parentId: "3" },
      { id: "3-2", name: "Экспорт", parentId: "3" },
    ],
    createdAt: new Date() 
  },
  { 
    id: "4", 
    name: "Интранет систем", 
    description: "Дотоод сүлжээний систем", 
    subCategories: [],
    createdAt: new Date() 
  },
]

const defaultErrors: ErrorRecord[] = [
  {
    id: "1",
    keyword: "Нэвтрэх алдаа",
    description: "Business Central руу нэвтрэхэд 'Invalid credentials' алдаа гарч байна",
    solution: "1. Хэрэглэгчийн нэр, нууц үгээ шалгана уу.\n2. Caps Lock унтраасан эсэхийг шалгана уу.\n3. Админтай холбогдож нууц үгээ шинэчлүүлнэ үү.",
    images: [],
    categoryId: "1",
    subCategoryId: "1-1",
    department: "IT хэлтэс",
    status: "active",
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: "2",
    keyword: "Тайлан гарахгүй",
    description: "Green ERP дээр тайлан export хийхэд алдаа гарч байна",
    solution: "1. Браузерын cache цэвэрлэнэ үү.\n2. Pop-up blocker-г унтраана уу.\n3. Өөр браузер ашиглаж үзнэ үү (Chrome санал болгоно).",
    images: [],
    categoryId: "2",
    subCategoryId: "2-1",
    department: "Санхүү хэлтэс",
    status: "active",
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: "3",
    keyword: "Хэвлэгч холбогдохгүй",
    description: "Albe Soft дээр баримт хэвлэхэд хэвлэгч олдохгүй байна",
    solution: "1. Хэвлэгч асаалттай эсэхийг шалгана уу.\n2. USB кабель холбогдсон эсэхийг шалгана уу.\n3. Хэвлэгчийн драйвер суулгасан эсэхийг шалгана уу.\n4. IT хэлтэст хандана уу.",
    images: [],
    categoryId: "3",
    subCategoryId: "3-1",
    department: "IT хэлтэс",
    status: "inactive",
    updatedAt: new Date(),
    createdAt: new Date(),
  },
]

export function getCategories(): Category[] {
  if (typeof window === "undefined") return defaultCategories
  try {
    const stored = localStorage.getItem("support_categories")
    if (stored) {
      const parsed = JSON.parse(stored)
      // createdAt-г Date объект болгон хөрвүүлэх
      return parsed.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        subCategories: cat.subCategories || []
      }))
    }
  } catch (err) {
    console.error("Error loading categories:", err)
  }
  localStorage.setItem("support_categories", JSON.stringify(defaultCategories))
  return defaultCategories
}

export function saveCategories(categories: Category[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("support_categories", JSON.stringify(categories))
  }
}

export function getErrorRecords(): ErrorRecord[] {
  if (typeof window === "undefined") return defaultErrors
  try {
    const stored = localStorage.getItem("support_errors")
    if (stored) {
      const parsed = JSON.parse(stored)
      // Date объектуудыг хөрвүүлэх
      return parsed.map((err: any) => ({
        ...err,
        createdAt: new Date(err.createdAt),
        updatedAt: new Date(err.updatedAt),
      }))
    }
  } catch (err) {
    console.error("Error loading errors:", err)
  }
  localStorage.setItem("support_errors", JSON.stringify(defaultErrors))
  return defaultErrors
}

export function saveErrorRecords(errors: ErrorRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("support_errors", JSON.stringify(errors))
  }
}