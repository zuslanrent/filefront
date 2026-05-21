"use client"

import { useState, useEffect, useMemo } from "react"
import { Headphones, Bell, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Category, ErrorRecord } from "@/lib/types"
import { CategorySidebar, SearchHeader, ErrorTable, ImageLightbox } from "@/components/support/search-components"
import { ErrorDetail } from "@/components/support/error-detail"
import { ErrorForm } from "@/components/support/error-form"
import { CategoryManager } from "@/components/support/category-manager"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SupportPage() {
  const [categories, setCategories]                   = useState<Category[]>([])
  const [errors, setErrors]                           = useState<ErrorRecord[]>([])
  const [searchQuery, setSearchQuery]                 = useState("")
  const [selectedCategory, setSelectedCategory]       = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment]   = useState("all")
  const [selectedStatus, setSelectedStatus]           = useState("all")
  const [selectedError, setSelectedError]             = useState<ErrorRecord | null>(null)
  const [showForm, setShowForm]                       = useState(false)
  const [editingError, setEditingError]               = useState<ErrorRecord | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [deleteConfirm, setDeleteConfirm]             = useState<ErrorRecord | null>(null)
  const [lightboxImages, setLightboxImages]           = useState<string[]>([])

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/categories`)
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch (err) { console.error('Ангилал татахад алдаа:', err) }
  }

  const fetchErrors = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/errors`)
      const data = await res.json()
      if (data.success) setErrors(data.data)
    } catch (err) { console.error('Алдаа татахад алдаа:', err) }
  }

  useEffect(() => {
    fetchCategories()
    fetchErrors()
  }, [])

  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesCategory   = !selectedCategory || error.categoryId === selectedCategory
      const matchesDepartment = selectedDepartment === "all" || error.department === selectedDepartment
      const matchesStatus     = selectedStatus === "all" || error.status === selectedStatus
      const matchesSearch     = !searchQuery ||
        error.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error.solution || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesDepartment && matchesStatus && matchesSearch
    })
  }, [errors, selectedCategory, selectedDepartment, selectedStatus, searchQuery])

  const activeCount = useMemo(() => errors.filter(e => e.status === "active").length, [errors])

  const handleSaveError = async (errorData: Omit<ErrorRecord, "id" | "createdAt">) => {
    try {
      const url    = editingError ? `${API_URL}/api/itsupport/errors/${editingError.id}` : `${API_URL}/api/itsupport/errors`
      const method = editingError ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      })
      const data = await res.json()
      if (data.success) { await fetchErrors(); setShowForm(false); setEditingError(null) }
    } catch (err) { console.error('Хадгалахад алдаа:', err) }
  }

  const handleSaveCategories = async (newCategories: Category[]) => {
    await fetchCategories()
  }

  const handleEditError = (error: ErrorRecord) => {
    setSelectedError(null)
    setEditingError(error)
    setShowForm(true)
  }

  const handleDeleteError = (error: ErrorRecord) => setDeleteConfirm(error)

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/errors/${deleteConfirm.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { await fetchErrors(); setDeleteConfirm(null) }
    } catch (err) { console.error('Устгахад алдаа:', err) }
  }

  const handleToggleStatus = async (error: ErrorRecord) => {
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/errors/${error.id}/toggle`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) await fetchErrors()
    } catch (err) { console.error('Төлөв өөрчлөхөд алдаа:', err) }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setSelectedDepartment("all")
    setSelectedStatus("all")
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
              <Headphones className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-card-foreground">IT Support</h1>
              <p className="text-sm text-muted-foreground">Программ хангамжийн тусламжийн систем</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 gap-2">
              <History className="h-4 w-4" />Audit Log
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 gap-2">
              <Bell className="h-4 w-4" />Notification
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onManageCategories={() => setShowCategoryManager(true)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddNew={() => { setEditingError(null); setShowForm(true) }}
            categories={categories}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            totalCount={errors.length}
            activeCount={activeCount}
            onClearFilters={handleClearFilters}
          />
          <ErrorTable
            errors={filteredErrors}
            categories={categories}
            onViewImages={setLightboxImages}
            onSelectError={setSelectedError}
            onEditError={handleEditError}
            onDeleteError={handleDeleteError}
            onToggleStatus={handleToggleStatus}
          />
        </main>
      </div>

      <ImageLightbox images={lightboxImages} open={lightboxImages.length > 0} onClose={() => setLightboxImages([])} />

      {selectedError && (
        <ErrorDetail
          error={selectedError} categories={categories}
          onClose={() => setSelectedError(null)}
          onEdit={handleEditError} onDelete={handleDeleteError} onToggleStatus={handleToggleStatus}
        />
      )}

      {showForm && (
        <ErrorForm
          categories={categories} editingError={editingError}
          onSave={handleSaveError}
          onClose={() => { setShowForm(false); setEditingError(null) }}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onSave={handleSaveCategories}
          onClose={() => setShowCategoryManager(false)}
          onRefresh={fetchCategories}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteConfirm?.keyword}&quot; бүртгэлийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}