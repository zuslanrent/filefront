'use client'

import { useState, useEffect, useMemo } from 'react'
import { RegulationsHeader } from '@/components/regulations/regulations-header'
import { RegulationsFilters } from '@/components/regulations/regulations-filters'
import { RegulationsGroupedTable } from '@/components/regulations/regulations-grouped-table'
import { getRegulations, updateRegulation, saveRegulations, addAuditLog } from '@/lib/mock-data/regulations'
import { getCategories, addCategory } from '@/lib/mock-data/categories'
import { currentUser, canUserUpload } from '@/lib/mock-data/users'
import type { RegulationFile, FilterOptions, Category } from '@/types/regulations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<RegulationFile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    department: 'all',
    category: 'all',
    status: 'all',
    sortBy: 'newest',
  })

  // Dialog states
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean
    regulation: RegulationFile | null
  }>({ open: false, regulation: null })
  const [deactivateReason, setDeactivateReason] = useState('')

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    regulation: RegulationFile | null
  }>({ open: false, regulation: null })

  const [newCategoryDialog, setNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  const canManage = canUserUpload(currentUser)

  useEffect(() => {
    const data = getRegulations()
    setRegulations(data)
    setCategories(getCategories())
  }, [])

  // Filter and sort regulations
  const filteredRegulations = useMemo(() => {
    let result = [...regulations]

    // Filter by search term (filename search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.fileName.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by department
    if (filters.department !== 'all') {
      result = result.filter((r) => r.department === filters.department)
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter((r) => r.category === filters.category)
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status)
    }

    // Filter by date range
    if (filters.dateFrom) {
      result = result.filter((r) => new Date(r.uploadedAt) >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      result = result.filter((r) => new Date(r.uploadedAt) <= filters.dateTo!)
    }

    // Filter by view permission
    result = result.filter(
      (r) => r.viewPermissions.includes(currentUser.department) || currentUser.department === 'it'
    )

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'mn'))
        break
      case 'updated':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
    }

    return result
  }, [regulations, filters])

  const activeCount = regulations.filter((r) => r.status === 'active').length

  // Handle deactivate
  const handleDeactivate = (regulation: RegulationFile) => {
    setDeactivateDialog({ open: true, regulation })
    setDeactivateReason('')
  }

  const confirmDeactivate = () => {
    if (!deactivateDialog.regulation || !deactivateReason) return

    const updated = {
      ...deactivateDialog.regulation,
      status: 'inactive' as const,
      inactivatedAt: new Date(),
      inactivatedReason: deactivateReason,
    }

    updateRegulation(updated.id, updated)
    
    addAuditLog({
      fileId: updated.id,
      fileName: updated.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'inactivate',
      timestamp: new Date(),
      details: deactivateReason,
    })

    setRegulations(getRegulations())
    setDeactivateDialog({ open: false, regulation: null })
  }

  // Handle delete
  const handleDelete = (regulation: RegulationFile) => {
    setDeleteDialog({ open: true, regulation })
  }

  const confirmDelete = () => {
    if (!deleteDialog.regulation) return

    const allRegs = getRegulations()
    const filtered = allRegs.filter(r => r.id !== deleteDialog.regulation!.id)
    saveRegulations(filtered)

    addAuditLog({
      fileId: deleteDialog.regulation.id,
      fileName: deleteDialog.regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'delete',
      timestamp: new Date(),
    })

    setRegulations(filtered)
    setDeleteDialog({ open: false, regulation: null })
  }

  // Handle edit
  const handleEdit = (regulation: RegulationFile) => {
    // Navigate to edit page
    window.location.href = `/regulations/${regulation.id}/edit`
  }

  // Handle new category
  const handleAddCategory = () => {
    if (!newCategoryName) return

    const newCat = addCategory({
      name: newCategoryName,
      description: newCategoryDesc,
    })

    setCategories([...categories, newCat])
    setNewCategoryDialog(false)
    setNewCategoryName('')
    setNewCategoryDesc('')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <RegulationsHeader
            totalCount={regulations.length}
            activeCount={activeCount}
            canUpload={canManage}
          />

          {/* Filters */}
          <RegulationsFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
          />

          {/* Add category button */}
          {canManage && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCategoryDialog(true)}
              >
                <Plus className="size-4 mr-2" />
                Шинэ бүлэг нэмэх
              </Button>
            </div>
          )}

          {/* Grouped Table */}
          <RegulationsGroupedTable
            regulations={filteredRegulations}
            categories={categories}
            userDepartment={currentUser.department}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
          />
        </div>
      </div>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onOpenChange={(open) => setDeactivateDialog({ open, regulation: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хүчингүй болгох</DialogTitle>
            <DialogDescription>
              {deactivateDialog.regulation?.name} журмыг хүчингүй болгохдоо итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Шалтгаан *</Label>
              <Textarea
                id="reason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Хүчингүй болгосон шалтгааныг бичнэ үү..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialog({ open: false, regulation: null })}
            >
              Цуцлах
            </Button>
            <Button
              onClick={confirmDeactivate}
              disabled={!deactivateReason}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Хүчингүй болгох
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, regulation: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгах</DialogTitle>
            <DialogDescription>
              {deleteDialog.regulation?.name} журмыг устгахдаа итгэлтэй байна уу? 
              Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, regulation: null })}
            >
              Цуцлах
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ бүлэг үүсгэх</DialogTitle>
            <DialogDescription>
              Дүрэм журмын шинэ бүлэг (ангилал) үүсгэх
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Бүлгийн нэр *</Label>
              <Input
                id="catName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Жишээ: Гэрээ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">Тайлбар</Label>
              <Input
                id="catDesc"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Бүлгийн товч тайлбар"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName}>
              Үүсгэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
