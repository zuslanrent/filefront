"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, FileImage, Trash2, ZoomIn, Download, ImagePlus, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorRecord, Category, SubCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ErrorFormProps {
  categories: Category[]
  departments: string[] // 👈 Дээд хуудаснаас статик жагсаалтыг хүлээж авах пропс нэмэв
  editingError: ErrorRecord | null
  onSave: (error: Omit<ErrorRecord, "id" | "createdAt">) => void
  onClose: () => void
}

export function ErrorForm({ categories, departments, editingError, onSave, onClose }: ErrorFormProps) {
  const [keyword, setKeyword] = useState(editingError?.keyword || "")
  const [description, setDescription] = useState(editingError?.description || "")
  const [solution, setSolution] = useState(editingError?.solution || "")
  const [categoryId, setCategoryId] = useState(editingError?.categoryId || "")
  const [subCategoryId, setSubCategoryId] = useState(editingError?.subCategoryId || "")
  const [department, setDepartment] = useState(editingError?.department || "")
  const [status, setStatus] = useState<"active" | "inactive">(editingError?.status || "active")
  const [images, setImages] = useState<string[]>(editingError?.images || [])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ❌ Хуучин хатуу кодчилсон массив устсан:
  // const departments = ["IT хэлтэс", "Санхүү хэлтэс", ...]

  // Update sub-categories when category changes
  useEffect(() => {
    const selectedCategory = categories.find((c) => c.id === categoryId)
    setSubCategories(selectedCategory?.subCategories || [])
    if (!selectedCategory?.subCategories?.find((s) => s.id === subCategoryId)) {
      setSubCategoryId("")
    }
  }, [categoryId, categories, subCategoryId])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          setImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword || !description || !categoryId || !department) return

    onSave({
      keyword,
      description,
      solution,
      categoryId,
      subCategoryId: subCategoryId || undefined,
      department,
      status,
      images,
      updatedAt: new Date(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                {editingError ? "Бүртгэл засах" : "Шинэ алдаа бүртгэх"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Алдааны мэдээллийг оруулна уу
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm font-medium">Түлхүүр үг *</Label>
            <Input
              id="keyword"
              placeholder="Жишээ: Нэвтрэх алдаа"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Асуудлын дэлгэрэнгүй тайлбар *</Label>
            <Textarea
              id="description"
              placeholder="Алдааны дэлгэрэнгүй тайлбар оруулна уу..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution" className="text-sm font-medium">Шийдэл / Засах заавар</Label>
            <Textarea
              id="solution"
              placeholder="Алдааг хэрхэн засах зааврыг оруулна уу..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={6}
              className="font-mono text-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Ангилал *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory" className="text-sm font-medium">Дэд ангилал</Label>
              <Select 
                value={subCategoryId} 
                onValueChange={setSubCategoryId}
                disabled={subCategories.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={subCategories.length === 0 ? "Дэд ангилал байхгүй" : "Дэд ангилал сонгох"} />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">Хариуцсан хэлтэс *</Label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Хэлтэс сонгох" />
              </SelectTrigger>
              <SelectContent>
                {/* 🎯 Пропсоор орж ирсэн систем даяарх нэгдсэн жагсаалтыг зурж байна */}
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/30">
            <div>
              <Label htmlFor="status" className="text-sm font-medium">Төлөв</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Идэвхтэй бол ажилтнууд харж болно
              </p>
            </div>
            <Switch
              id="status"
              checked={status === "active"}
              onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Хавсралт зураг (PNG, SVG)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-primary/10 mb-3">
                <ImagePlus className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-medium text-card-foreground">
                Зураг оруулахын тулд энд дарна уу
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, SVG форматтай зураг (олон зураг оруулах боломжтой)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {images.length > 0 && (
              <div className="space-y-2 mt-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-border rounded-xl bg-muted/20 group hover:bg-muted/40 transition-colors"
                  >
                    <div 
                      className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer relative group/img"
                      onClick={() => setPreviewImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Зураг ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-card-foreground truncate">
                          Зураг {index + 1}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG/SVG</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewImage(image)}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = image
                          link.download = `image-${index + 1}.png`
                          link.click()
                        }}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(index)}
                        className="h-9 w-9 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">
              Цуцлах
            </Button>
            <Button type="submit" className="rounded-xl px-6 bg-primary hover:bg-primary/90">
              {editingError ? "Хадгалах" : "Бүртгэх"}
            </Button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 text-white hover:bg-white/20 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              const link = document.createElement("a")
              link.href = previewImage
              link.download = "image.png"
              link.click()
            }}
          >
            <Download className="h-5 w-5" />
          </Button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}