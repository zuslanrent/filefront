'use client'

import { useState, useEffect } from 'react'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Subcategory {
  uuid: string
  name: string
}

interface Category {
  uuid:          string
  name:          string
  subcategories: Subcategory[]
}

interface CategorySelectorProps {
  categoryValue:    string
  subcategoryValue: string
  onCategoryChange:    (val: string) => void
  onSubcategoryChange: (val: string) => void
}

export function CategorySelector({
  categoryValue,
  subcategoryValue,
  onCategoryChange,
  onSubcategoryChange,
}: CategorySelectorProps) {
  const [categories, setCategories]       = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => { if (data.success) setCategories(data.data) })
      .catch(err => console.error('Ангилал татахад алдаа:', err))
  }, [])

  // Ангилал сонгоход дэд ангилалуудыг шинэчлэх
  const handleCategoryChange = (val: string) => {
    onCategoryChange(val)
    onSubcategoryChange('') // Дэд ангилал цэвэрлэх

    const selected = categories.find(c => c.uuid === val)
    setSubcategories(selected?.subcategories || [])
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Ангилал */}
      <div className="space-y-2">
        <Label>Ангилал *</Label>
        <Select value={categoryValue} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ангилал сонгох" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.uuid} value={cat.uuid}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Дэд ангилал */}
      <div className="space-y-2">
        <Label>Дэд ангилал</Label>
        <Select
          value={subcategoryValue}
          onValueChange={onSubcategoryChange}
          disabled={!categoryValue || subcategories.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !categoryValue
                ? 'Эхлээд ангилал сонгоно уу'
                : subcategories.length === 0
                  ? 'Дэд ангилал байхгүй'
                  : 'Дэд ангилал сонгох'
            } />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map(sub => (
              <SelectItem key={sub.uuid} value={sub.uuid}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}