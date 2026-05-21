"use client"

import { useState } from "react"
import { X, Calendar, Building2, ImageIcon, Pencil, Ban, Trash2, Download, ZoomIn, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ErrorRecord, Category } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ErrorDetailProps {
  error: ErrorRecord
  categories: Category[]
  onClose: () => void
  onEdit: (error: ErrorRecord) => void
  onDelete: (error: ErrorRecord) => void
  onToggleStatus: (error: ErrorRecord) => void
}

export function ErrorDetail({ error, categories, onClose, onEdit, onDelete, onToggleStatus }: ErrorDetailProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Тодорхойгүй"
  }

  const getSubCategoryName = (categoryId: string, subCategoryId?: string) => {
    if (!subCategoryId) return null
    const category = categories.find((c) => c.id === categoryId)
    const sub = category?.subCategories?.find((s) => s.id === subCategoryId)
    return sub?.name || null
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const subCategoryName = getSubCategoryName(error.categoryId, error.subCategoryId)

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Алдааны дэлгэрэнгүй
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(error)}
              className="rounded-xl h-9"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Засах
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStatus(error)}
              className={cn(
                "rounded-xl h-9",
                error.status === "active" ? "text-blue-600 hover:text-blue-600" : "text-emerald-600 hover:text-emerald-600"
              )}
            >
              <Ban className="h-4 w-4 mr-2" />
              {error.status === "active" ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onClose()
                onDelete(error)
              }}
              className="text-destructive hover:text-destructive rounded-xl h-9"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Устгах
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-card-foreground mb-3">
                {error.keyword}
              </h1>
              <Badge
                variant={error.status === "active" ? "default" : "secondary"}
                className={cn(
                  "rounded-lg px-3 py-1 flex-shrink-0",
                  error.status === "active"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                )}
              >
                {error.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium">
                {getCategoryName(error.categoryId)}
              </span>
              {subCategoryName && (
                <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg">
                  {subCategoryName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {error.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(error.updatedAt)}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Асуудлын тайлбар
            </h3>
            <p className="text-card-foreground bg-muted/50 p-4 rounded-xl leading-relaxed">
              {error.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Шийдэл / Засах заавар
            </h3>
            <div className="bg-muted/50 p-4 rounded-xl">
              <pre className="text-card-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {error.solution || "Шийдэл оруулаагүй байна."}
              </pre>
            </div>
          </div>

          {error.images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Хавсаргасан зураг ({error.images.length})
              </h3>
              <div className="space-y-3">
                {error.images.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-border rounded-xl bg-muted/20 group hover:bg-muted/40 transition-colors"
                  >
                    <div 
                      className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 cursor-pointer relative group/img"
                      onClick={() => setPreviewImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Алдааны зураг ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        Зураг {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG/SVG</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewImage(image)}
                        className="rounded-xl"
                      >
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Харах
                      </Button>
                      <a
                        href={image}
                        download={`image-${index + 1}.png`}
                        className="flex-shrink-0"
                      >
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Download className="h-4 w-4 mr-2" />
                          Татах
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
