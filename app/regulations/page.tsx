'use client'

import { useState, useEffect, useMemo } from 'react'
import { RegulationsHeader } from '@/components/regulations/regulations-header'
import { RegulationsFilters } from '@/components/regulations/regulations-filters'
import { RegulationsGroupedTable } from '@/components/regulations/regulations-grouped-table'
import { getRegulations, updateRegulation, saveRegulations, addAuditLog } from '@/lib/mock-data/regulations'
import { currentUser, canUserUpload } from '@/lib/mock-data/users'
import type { RegulationFile, FilterOptions, Category } from '@/types/regulations'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<RegulationFile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    search: '', department: 'all', category: 'all', status: 'all', sortBy: 'newest',
  })

  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; regulation: RegulationFile | null }>({ open: false, regulation: null })
  const [deactivateReason, setDeactivateReason] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; regulation: RegulationFile | null }>({ open: false, regulation: null })
  const [newCategoryDialog, setNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const canManage = canUserUpload(currentUser)

  // Groups-ийг API-аас татах
  const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/api/groups`) // header хэрэггүй
    const data = await res.json()
    if (data.success) {
      const mapped: Category[] = data.data.map((g: any) => ({
        id:          g.uuid,
        name:        g.group_name,
        description: g.description || '',
      }))
      setCategories(mapped)
    }
  } catch (err) {
    console.error('Бүлэг татахад алдаа:', err)
  }
}

  useEffect(() => {
    setRegulations(getRegulations())
    fetchCategories()
  }, [])

  const filteredRegulations = useMemo(() => {
    let result = [...regulations]
    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.fileName.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s)
      )
    }
    if (filters.department !== 'all') result = result.filter(r => r.department === filters.department)
    if (filters.category !== 'all')   result = result.filter(r => r.category === filters.category)
    if (filters.status !== 'all')     result = result.filter(r => r.status === filters.status)
    if (filters.dateFrom)             result = result.filter(r => new Date(r.uploadedAt) >= filters.dateFrom!)
    if (filters.dateTo)               result = result.filter(r => new Date(r.uploadedAt) <= filters.dateTo!)
    result = result.filter(r => r.viewPermissions.includes(currentUser.department) || currentUser.department === 'it')
    switch (filters.sortBy) {
      case 'newest':  result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()); break
      case 'oldest':  result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()); break
      case 'name':    result.sort((a, b) => a.name.localeCompare(b.name, 'mn')); break
      case 'updated': result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break
    }
    return result
  }, [regulations, filters])

  const activeCount = regulations.filter(r => r.status === 'active').length

  const handleDeactivate = (regulation: RegulationFile) => {
    setDeactivateDialog({ open: true, regulation })
    setDeactivateReason('')
  }

  const confirmDeactivate = () => {
    if (!deactivateDialog.regulation || !deactivateReason) return
    const updated = { ...deactivateDialog.regulation, status: 'inactive' as const, inactivatedAt: new Date(), inactivatedReason: deactivateReason }
    updateRegulation(updated.id, updated)
    addAuditLog({ fileId: updated.id, fileName: updated.name, userId: currentUser.id, userName: currentUser.name, userDepartment: currentUser.department, action: 'inactivate', timestamp: new Date(), details: deactivateReason })
    setRegulations(getRegulations())
    setDeactivateDialog({ open: false, regulation: null })
  }

  const handleDelete = (regulation: RegulationFile) => setDeleteDialog({ open: true, regulation })

  const confirmDelete = () => {
    if (!deleteDialog.regulation) return
    const allRegs = getRegulations()
    const filtered = allRegs.filter(r => r.id !== deleteDialog.regulation!.id)
    saveRegulations(filtered)
    addAuditLog({ fileId: deleteDialog.regulation.id, fileName: deleteDialog.regulation.name, userId: currentUser.id, userName: currentUser.name, userDepartment: currentUser.department, action: 'delete', timestamp: new Date() })
    setRegulations(filtered)
    setDeleteDialog({ open: false, regulation: null })
  }

  const handleEdit = (regulation: RegulationFile) => {
    window.location.href = `/regulations/${regulation.id}/edit`
  }

  // Шинэ бүлэг → API-д хадгалж, дараа нь дахин татна
  const handleAddCategory = async () => {
    if (!newCategoryName) return
    setCategoryLoading(true)
    setCategoryError('')
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ group_name: newCategoryName, description: newCategoryDesc || null }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCategories() // Дахин татаж жагсаалт шинэчлэнэ
        setNewCategoryDialog(false)
        setNewCategoryName('')
        setNewCategoryDesc('')
      } else {
        setCategoryError(data.message || 'Алдаа гарлаа.')
      }
    } catch {
      setCategoryError('Сервертэй холбогдоход алдаа гарлаа.')
    } finally {
      setCategoryLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="space-y-6">
          <RegulationsHeader totalCount={regulations.length} activeCount={activeCount} canUpload={canManage} />
          <RegulationsFilters filters={filters} onFiltersChange={setFilters} categories={categories} />
          {canManage && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setNewCategoryDialog(true)}>
                <Plus className="size-4 mr-2" />
                Шинэ бүлэг нэмэх
              </Button>
            </div>
          )}
          <RegulationsGroupedTable
            regulations={filteredRegulations} categories={categories}
            userDepartment={currentUser.department} canManage={canManage}
            onEdit={handleEdit} onDelete={handleDelete} onDeactivate={handleDeactivate}
          />
        </div>
      </div>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialog.open} onOpenChange={(open) => setDeactivateDialog({ open, regulation: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хүчингүй болгох</DialogTitle>
            <DialogDescription>{deactivateDialog.regulation?.name} журмыг хүчингүй болгохдоо итгэлтэй байна уу?</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Шалтгаан *</Label>
            <Textarea id="reason" value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)} placeholder="Хүчингүй болгосон шалтгааныг бичнэ үү..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialog({ open: false, regulation: null })}>Цуцлах</Button>
            <Button onClick={confirmDeactivate} disabled={!deactivateReason} className="bg-orange-500 hover:bg-orange-600">Хүчингүй болгох</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, regulation: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгах</DialogTitle>
            <DialogDescription>{deleteDialog.regulation?.name} журмыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, regulation: null })}>Цуцлах</Button>
            <Button variant="destructive" onClick={confirmDelete}>Устгах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ бүлэг үүсгэх</DialogTitle>
            <DialogDescription>Дүрэм журмын шинэ бүлэг (ангилал) үүсгэх</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {categoryError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{categoryError}</p>}
            <div className="space-y-2">
              <Label htmlFor="catName">Бүлгийн нэр *</Label>
              <Input id="catName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Жишээ: Гэрээ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">Тайлбар</Label>
              <Input id="catDesc" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} placeholder="Бүлгийн товч тайлбар" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewCategoryDialog(false); setCategoryError('') }}>Цуцлах</Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName || categoryLoading}>
              {categoryLoading ? 'Хадгалж байна...' : 'Үүсгэх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}