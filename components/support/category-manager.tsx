"use client"

import { useState } from "react"
import { X, Plus, Trash2, Pencil, ChevronRight, FolderPlus, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Category, SubCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CategoryManagerProps {
  categories: Category[]
  onSave: (categories: Category[]) => void
  onClose: () => void
  onRefresh?: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ✅ Аутентификацийн толгой мэдээлэл авах функц
function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function CategoryManager({ categories, onSave, onClose, onRefresh }: CategoryManagerProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // ✅ БАГ ЗАСВАР: Ангилал бүрийн дэд ангилалын input-ийг тусад нь объект байдлаар хадгалах
  const [subCategoryInputs, setSubCategoryInputs] = useState<Record<string, string>>({})
  
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState("")

  // Ангилал нэмэх
  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      const res = await fetch(`${API_URL}/api/itsupport/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || null }),
      })
      const data = await res.json()
      if (data.success) {
        const newCat = { ...data.data, subCategories: [] }
        const updated = [...localCategories, newCat]
        setLocalCategories(updated)
        onSave(updated)
        setNewName("")
        setNewDescription("")
        onRefresh?.()
      }
    } catch (err) { console.error(err) }
  }

  // Ангилал устгах
  const handleDelete = async (id: string) => {
    if (!confirm("Та энэ ангилалыг устгахдаа итгэлтэй байна уу? Дагалдах дэд ангилалууд цуг устгагдана.")) return
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${id}`, { 
        method: 'DELETE',
        headers: authHeaders()
      })
      const updated = localCategories.filter(c => c.id !== id)
      setLocalCategories(updated)
      onSave(updated)
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || "")
  }

  // Ангилал засах
  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || null }),
      })
      const updated = localCategories.map(c =>
        c.id === editingId ? { ...c, name: editName.trim(), description: editDescription.trim() || undefined } : c
      )
      setLocalCategories(updated)
      onSave(updated)
      cancelEdit()
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
  }

  // Дэд ангилал нэмэх
  const handleAddSubCategory = async (categoryId: string) => {
    const subName = subCategoryInputs[categoryId]?.trim()
    if (!subName) return

    try {
      const res = await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: subName }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = localCategories.map(c =>
          c.id === categoryId ? { ...c, subCategories: [...(c.subCategories || []), data.data] } : c
        )
        setLocalCategories(updated)
        onSave(updated)
        // ✅ Зөвхөн тухайн ангилалын input-ийг цэвэрлэнэ
        setSubCategoryInputs(prev => ({ ...prev, [categoryId]: "" }))
        onRefresh?.()
      }
    } catch (err) { console.error(err) }
  }

  // Дэд ангилал устгах
  const handleDeleteSubCategory = async (categoryId: string, subId: string) => {
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories/${subId}`, { 
        method: 'DELETE',
        headers: authHeaders()
      })
      const updated = localCategories.map(c =>
        c.id === categoryId ? { ...c, subCategories: (c.subCategories || []).filter(s => s.id !== subId) } : c
      )
      setLocalCategories(updated)
      onSave(updated)
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  const startEditSub = (sub: SubCategory) => {
    setEditingSubId(sub.id)
    setEditSubName(sub.name)
  }

  // Дэд ангилал засах
  const saveEditSub = async (categoryId: string) => {
    if (!editingSubId || !editSubName.trim()) return
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories/${editingSubId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: editSubName.trim() }),
      })
      const updated = localCategories.map(c =>
        c.id === categoryId
          ? { ...c, subCategories: (c.subCategories || []).map(s => s.id === editingSubId ? { ...s, name: editSubName.trim() } : s) }
          : c
      )
      setLocalCategories(updated)
      onSave(updated)
      setEditingSubId(null)
      setEditSubName("")
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-border p-5 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Ангилал удирдах</h2>
              <p className="text-sm text-muted-foreground">Ангилал болон дэд ангилал үүсгэх</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3">
            {localCategories.map((category) => (
              <div key={category.id} className="rounded-xl border border-border overflow-hidden bg-background">
                {editingId === category.id ? (
                  <div className="p-4 space-y-3 bg-muted/10">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ангилалын нэр"
                      className="font-medium bg-background"
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Тайлбар (заавал биш)"
                      rows={2}
                      className="bg-background"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>Цуцлах</Button>
                      <Button size="sm" onClick={saveEdit}>Хадгалах</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Category Item */}
                    <div className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                      <button
                        onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedId === category.id && "rotate-90")} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-card-foreground truncate">{category.name}</h3>
                          {category.description && <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>}
                        </div>
                        {(category.subCategories?.length ?? 0) > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                            {category.subCategories?.length} дэд ангилал
                          </span>
                        )}
                      </button>
                      <div className="flex items-center gap-1 ml-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => startEdit(category)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Sub-categories List */}
                    {expandedId === category.id && (
                      <div className="border-t border-border bg-muted/5">
                        <div className="divide-y divide-border">
                          {(category.subCategories || []).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between py-3 px-4 pl-12 hover:bg-muted/10">
                              {editingSubId === sub.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    value={editSubName}
                                    onChange={(e) => setEditSubName(e.target.value)}
                                    className="h-8 text-sm bg-background"
                                    autoFocus
                                  />
                                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingSubId(null)}>Цуцлах</Button>
                                  <Button size="sm" className="h-8" onClick={() => saveEditSub(category.id)}>Хадгалах</Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    {sub.name}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditSub(sub)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteSubCategory(category.id, sub.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add sub-category input row */}
                        <div className="p-3 pl-12 bg-muted/20 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Input
                              value={subCategoryInputs[category.id] || ""}
                              onChange={(e) => setSubCategoryInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                              placeholder="Дэд ангилалын нэр..."
                              className="h-9 text-sm flex-1 bg-background"
                              onKeyDown={(e) => { if (e.key === "Enter") handleAddSubCategory(category.id) }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-lg gap-1.5 bg-background"
                              onClick={() => handleAddSubCategory(category.id)}
                              disabled={!(subCategoryInputs[category.id]?.trim())}
                            >
                              <FolderPlus className="h-3.5 w-3.5" />
                              Нэмэх
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* New Category Box */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Шинэ ангилал нэмэх
            </h3>
            <div className="space-y-3 p-4 rounded-xl border border-dashed border-border bg-muted/10">
              <div className="space-y-1">
                <Label htmlFor="newCategoryName" className="text-xs">Ангилалын нэр *</Label>
                <Input
                  id="newCategoryName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Жишээ: Microsoft Office"
                  className="h-10 bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newCategoryDesc" className="text-xs">Тайлбар</Label>
                <Textarea
                  id="newCategoryDesc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Тайлбар бичих..."
                  rows={2}
                  className="bg-background"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-lg border-dashed bg-background hover:bg-primary/5 hover:border-primary transition-colors"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" /> Ангилал үүсгэх
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end gap-3 bg-muted/30">
          <Button variant="outline" onClick={onClose} className="rounded-lg px-5">
            Хаах
          </Button>
        </div>
      </div>
    </div>
  )
}