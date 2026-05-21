'use client'

import { useState, useEffect } from 'react'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "")

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

// ✅ Аутентификацийн толгой мэдээлэл бэлдэх функц
function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function CategorySelector({
  categoryValue,
  subcategoryValue,
  onCategoryChange,
  onSubcategoryChange,
}: CategorySelectorProps) {
  const [categories, setCategories]       = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  // API-аас ангилалууд татах
  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: authHeaders()
    })
      .then(res => res.json())
      .then(data => { 
        if (data.success) setCategories(data.data) 
      })
      .catch(err => console.error('Ангилал татахад алдаа:', err))
  }, [])

  // ✅ БАГ ЗАСВАР: Анхлан ачаалагдах үед эсвэл categoryValue дээрээс өөрчлөгдөхөд 
  // дэд ангилалуудын жагсаалтыг автоматаар олж state-д хадгалах
  useEffect(() => {
    if (categories.length > 0 && categoryValue) {
      const selected = categories.find(c => c.uuid === categoryValue)
      setSubcategories(selected?.subcategories || [])
    } else {
      setSubcategories([])
    }
  }, [categoryValue, categories])

  // Хэрэглэгч гараараа ангилал солих үед
  const handleCategoryChange = (val: string) => {
    onCategoryChange(val)
    onSubcategoryChange('') // Өмнөх дэд ангилалын сонголтыг цэвэрлэнэ
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Ангилал */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ангилал <span className="text-destructive">*</span></Label>
        <Select value={categoryValue || undefined} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full bg-background">
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
        <Label className="text-sm font-medium">Дэд ангилал</Label>
        <Select
          value={subcategoryValue || undefined}
          onValueChange={onSubcategoryChange}
          disabled={!categoryValue || subcategories.length === 0}
        >
          <SelectTrigger className="w-full bg-background">
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