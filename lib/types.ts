export interface SubCategory {
  id: string
  name: string
  parentId: string
}

export interface Category {
  id: string
  name: string
  description?: string
  subCategories?: SubCategory[]
  createdAt: Date
}

export type ErrorStatus = "active" | "inactive"

export interface ErrorRecord {
  id: string
  keyword: string
  description: string
  solution: string
  images: string[]
  categoryId: string
  subCategoryId?: string
  department: string
  status: ErrorStatus
  updatedAt: Date
  createdAt: Date
}
