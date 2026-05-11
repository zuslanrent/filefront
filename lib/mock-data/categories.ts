import type { Category } from '@/types/regulations'

// LocalStorage key
const CATEGORIES_KEY = 'regulations_categories'

// Default categories (Бодлогын сан)
export const defaultCategories: Category[] = [
  {
    id: 'policy',
    name: 'Бодлого',
    description: 'Байгууллагын бодлогын баримт бичгүүд',
    order: 1,
  },
  {
    id: 'rule',
    name: 'Дүрэм',
    description: 'Дагаж мөрдөх дүрэм',
    order: 2,
  },
  {
    id: 'regulation',
    name: 'Журам',
    description: 'Үйл ажиллагааны журам',
    order: 3,
  },
  {
    id: 'guideline',
    name: 'Заавар',
    description: 'Ажлын заавар, удирдамж',
    order: 4,
  },
  {
    id: 'plan',
    name: 'Төлөвлөгөө',
    description: 'Төлөвлөгөө, стратеги',
    order: 5,
  },
  {
    id: 'requirement',
    name: 'Шаардлага',
    description: 'Шаардлага, нөхцөл',
    order: 6,
  },
  {
    id: 'standard',
    name: 'Стандарт',
    description: 'Стандарт, норм',
    order: 7,
  },
  {
    id: 'document',
    name: 'Баримт бичиг',
    description: 'Бусад баримт бичгүүд',
    order: 8,
  },
]

// Get categories from localStorage
export function getCategories(): Category[] {
  if (typeof window === 'undefined') return defaultCategories
  const stored = localStorage.getItem(CATEGORIES_KEY)
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories))
    return defaultCategories
  }
  return JSON.parse(stored)
}

// Save categories
export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

// Add new category
export function addCategory(category: Omit<Category, 'id' | 'order'>): Category {
  const categories = getCategories()
  const newCategory: Category = {
    ...category,
    id: `cat_${Date.now()}`,
    order: categories.length + 1,
  }
  categories.push(newCategory)
  saveCategories(categories)
  return newCategory
}

// Get category name by ID
export function getCategoryName(categoryId: string): string {
  const categories = getCategories()
  return categories.find(c => c.id === categoryId)?.name || categoryId
}
