'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// ✅ Бусад бүх фронтенд хэсэгтэй яг ижил, системд ашиглагдаж буй статик хэлтсийн жагсаалт
const STATIC_DEPARTMENTS = [
  "Бизнес хөгжлийн хэлтэс",
  "Санхүү төлөвлөлтийн хэлтэс",
  "Санхүү бүртгэлийн хэлтэс",
  "Хүний нөөцийн хэлтэс",
  "Хууль, эрх зүй гэрээний алба",
  "Захиргааны хэлтэс",
  "Мэдээлэл технологийн хэлтэс",
  "БОНЗ, Олон нийттэй харилцах хэлтэс",
  "Барилга угсралтын хэлтэс",
  "Төлөвлөгөө мониторинг чанарын удирдлагын хэлтэс",
  "Инженерингийн хэлтэс",
  "Эрсдэл дотоод хяналтын алба",
  "Хөдлөх бүрэлдэхүүний хэлтэс",
  "Судалгаа, Хөгжүүлэлтийн R&D төв",
  "Худалдан авалтын хэлтэс",
  "Захиргаа, аж ахуй, тээвэр удирдлагын хэлтэс"
]

interface PermissionSelectorProps {
  title: string
  description: string
  selectedDepartments: string[] // 👈 ID биш, сонгогдсон хэлтсийн нэрс (Текст) массив хэлбэрээр орж ирнэ
  onSelectionChange: (departments: string[]) => void
}

export function PermissionSelector({
  title,
  description,
  selectedDepartments,
  onSelectionChange,
}: PermissionSelectorProps) {

  // "Бүх хэлтэс" сонгох эсвэл цуцлах үед
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange([...STATIC_DEPARTMENTS]) // Бүх хэлтсийн нэрийг массивт хуулна
    } else {
      onSelectionChange([]) // Массивыг хоосон болгоно
    }
  }

  // Тухайн нэг хэлтсийг сонгох эсвэл цуцлах үед
  const handleDepartmentToggle = (deptName: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDepartments, deptName])
    } else {
      onSelectionChange(selectedDepartments.filter(name => name !== deptName))
    }
  }

  // Бүх хэлтэс сонгогдсон эсэхийг шалгах логик (Нэрээр нь шалгана)
  const allSelected = STATIC_DEPARTMENTS.length > 0 && STATIC_DEPARTMENTS.every(dept => selectedDepartments.includes(dept))
  const someSelected = selectedDepartments.length > 0 && !allSelected

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        {/* Бүгдийг сонгох Checkbox */}
        <div className="flex items-center gap-2 pb-3 border-b">
          <Checkbox
            id={`${title}-all`}
            checked={allSelected}
            data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
            onCheckedChange={(checked) => handleSelectAll(checked === true)}
          />
          <Label htmlFor={`${title}-all`} className="text-sm font-medium cursor-pointer">
            Бүх хэлтэс
          </Label>
        </div>

        {/* Хэлтсүүдийн жагсаалт (Статик массиваас шууд зурна) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STATIC_DEPARTMENTS.map(dept => (
            <div key={dept} className="flex items-center gap-2 py-0.5">
              <Checkbox
                id={`${title}-${dept}`}
                checked={selectedDepartments.includes(dept)}
                onCheckedChange={(checked) =>
                  handleDepartmentToggle(dept, checked === true)
                }
              />
              <Label
                htmlFor={`${title}-${dept}`}
                className="text-sm cursor-pointer select-none truncate"
              >
                {dept}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedDepartments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedDepartments.length} хэлтэс сонгогдсон
        </p>
      )}
    </div>
  )
}