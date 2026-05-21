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
  onRefresh?: () => Promise<void>  // ← нэмэх
}

export function CategoryManager({ categories, onSave, onClose, onRefresh }: CategoryManagerProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState("")
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState("")

  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/categories`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${id}`, { method: 'DELETE' })
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

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || null }),
      })
      const updated = localCategories.map(c =>
        c.id === editingId ? { ...c, name: editName.trim(), description: editDescription.trim() || undefined } : c
      )
      setLocalCategories(updated)
      onSave(updated)
      setEditingId(null); setEditName(""); setEditDescription("")
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
  }

  // Sub-category functions
  const handleAddSubCategory = async (categoryId: string) => {
    if (!newSubName.trim()) return
    try {
      const res  = await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubName.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = localCategories.map(c =>
          c.id === categoryId ? { ...c, subCategories: [...(c.subCategories || []), data.data] } : c
        )
        setLocalCategories(updated)
        onSave(updated)
        setNewSubName("")
        onRefresh?.()
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteSubCategory = async (categoryId: string, subId: string) => {
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories/${subId}`, { method: 'DELETE' })
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

  const saveEditSub = async (categoryId: string) => {
    if (!editingSubId || !editSubName.trim()) return
    try {
      await fetch(`${API_URL}/api/itsupport/categories/${categoryId}/subcategories/${editingSubId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSubName.trim() }),
      })
      const updated = localCategories.map(c =>
        c.id === categoryId
          ? { ...c, subCategories: (c.subCategories || []).map(s => s.id === editingSubId ? { ...s, name: editSubName.trim() } : s) }
          : c
      )
      setLocalCategories(updated)
      onSave(updated)
      setEditingSubId(null); setEditSubName("")
      onRefresh?.()
    } catch (err) { console.error(err) }
  }

  const handleSave = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl">
        <div className="border-b border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Ангилал удирдах
              </h2>
              <p className="text-sm text-muted-foreground">
                Ангилал болон дэд ангилал үүсгэх
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3 mb-6">
            {localCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-border overflow-hidden bg-background"
              >
                {editingId === category.id ? (
                  <div className="p-4 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ангилалын нэр"
                      className="font-medium"
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Тайлбар (заавал биш)"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="rounded-lg">
                        Цуцлах
                      </Button>
                      <Button size="sm" onClick={saveEdit} className="rounded-lg bg-primary hover:bg-primary/90">
                        Хадгалах
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Category Header */}
                    <div className="flex items-center justify-between p-4 bg-muted/30">
                      <button
                        onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            expandedId === category.id && "rotate-90"
                          )}
                        />
                        <div>
                          <h3 className="font-medium text-card-foreground">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {(category.subCategories?.length ?? 0) > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {category.subCategories?.length} дэд ангилал
                          </span>
                        )}
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10"
                          onClick={() => startEdit(category)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {expandedId === category.id && (
                      <div className="border-t border-border">
                        {(category.subCategories || []).length > 0 && (
                          <div className="divide-y divide-border">
                            {category.subCategories?.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between py-3 px-4 pl-12 hover:bg-muted/20"
                              >
                                {editingSubId === sub.id ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input
                                      value={editSubName}
                                      onChange={(e) => setEditSubName(e.target.value)}
                                      className="h-8 text-sm"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 rounded-lg"
                                      onClick={() => setEditingSubId(null)}
                                    >
                                      Цуцлах
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-8 rounded-lg"
                                      onClick={() => saveEditSub(category.id)}
                                    >
                                      Хадгалах
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                      {sub.name}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 rounded-lg"
                                        onClick={() => startEditSub(sub)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteSubCategory(category.id, sub.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add sub-category */}
                        <div className="p-4 pl-12 bg-muted/10">
                          <div className="flex items-center gap-2">
                            <Input
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              placeholder="Дэд ангилалын нэр..."
                              className="h-9 text-sm flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddSubCategory(category.id)
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-lg gap-1.5"
                              onClick={() => handleAddSubCategory(category.id)}
                              disabled={!newSubName.trim()}
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

          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Шинэ ангилал нэмэх
            </h3>
            <div className="space-y-3 p-4 rounded-xl border border-dashed border-border bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="newCategoryName" className="text-sm">Ангилалын нэр *</Label>
                <Input
                  id="newCategoryName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Жишээ: Microsoft Office"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCategoryDesc" className="text-sm">Тайлбар</Label>
                <Textarea
                  id="newCategoryDesc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Тайлбар (заавал биш)"
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-lg border-dashed hover:border-solid hover:border-primary hover:bg-primary/5"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ангилал нэмэх
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-5 flex justify-end gap-3 bg-muted/20">
          <Button variant="outline" onClick={onClose} className="rounded-lg px-6">
            Цуцлах
          </Button>
          <Button onClick={handleSave} className="rounded-lg px-6 bg-primary hover:bg-primary/90">
            Хадгалах
          </Button>
        </div>
      </div>
    </div>
  )
}
