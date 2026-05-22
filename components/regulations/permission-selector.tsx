'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const DEPT_URL = '/api/departments'

interface Department {
  id: string | number
  name: string
}

interface PermissionSelectorProps {
  title: string
  description: string
  selectedDepartments: string[]
  onSelectionChange: (departments: string[]) => void
}

export function PermissionSelector({
  title,
  description,
  selectedDepartments,
  onSelectionChange,
}: PermissionSelectorProps) {
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    fetch(DEPT_URL)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data ?? []
        setDepartments(list)
      })
      .catch(err => console.error('Хэлтэс татахад алдаа:', err))
  }, [])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(departments.map(d => String(d.id)))
    } else {
      onSelectionChange([])
    }
  }

  const handleDepartmentToggle = (departmentId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDepartments, departmentId])
    } else {
      onSelectionChange(selectedDepartments.filter(id => id !== departmentId))
    }
  }

  const allSelected = departments.length > 0 && departments.every(d => selectedDepartments.includes(String(d.id)))
  const someSelected = selectedDepartments.length > 0 && !allSelected

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        {/* Select all */}
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

        {/* Department list */}
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Уншиж байна...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center gap-2">
                <Checkbox
                  id={`${title}-${dept.id}`}
                  checked={selectedDepartments.includes(String(dept.id))}
                  onCheckedChange={(checked) =>
                    handleDepartmentToggle(String(dept.id), checked === true)
                  }
                />
                <Label
                  htmlFor={`${title}-${dept.id}`}
                  className="text-sm cursor-pointer"
                >
                  {dept.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDepartments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedDepartments.length} хэлтэс сонгогдсон
        </p>
      )}
    </div>
  )
}