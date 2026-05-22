"use client"

import { Search, Plus, Settings, ChevronDown, Filter, MoreHorizontal, Eye, FileText, Pencil, Ban, Trash2, Building2, Clock, ChevronUp, Download, ZoomIn, X, ChevronRight, Layers, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Category, ErrorRecord } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

// Image Lightbox Component
interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (images.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = images[currentIndex]
    link.download = `image-${currentIndex + 1}.png`
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
        <DialogTitle className="sr-only">Зураг харах</DialogTitle>
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white hover:bg-white/20 rounded-full"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </Button>

          {/* Image */}
          <div className="flex items-center justify-center min-h-[60vh] p-8">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={handlePrev}
              >
                <ChevronDown className="h-6 w-6 rotate-90" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={handleNext}
              >
                <ChevronDown className="h-6 w-6 -rotate-90" />
              </Button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 right-4 text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
  onManageCategories: () => void
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onManageCategories,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <aside className="w-72 border-r border-border bg-sidebar h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sidebar-foreground">Ангилал</h2>
        </div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all font-medium",
            selectedCategory === null
              ? "bg-blue-300 text-primary-foreground shadow-md"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          Бүх ангилал
        </button>
        
        <div className="mt-2 space-y-1">
          {categories.map((category) => {
            const hasSubCategories = (category.subCategories?.length ?? 0) > 0
            const isExpanded = expandedCategories.has(category.id)
            
            return (
              <div key={category.id}>
                <div className="flex items-center">
                  {hasSubCategories && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 hover:bg-sidebar-accent/50 rounded-md mr-1"
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCategory(category.id)}
                    className={cn(
                      "flex-1 text-left px-3 py-2.5 rounded-xl text-sm transition-all",
                      !hasSubCategories && "ml-6",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-md font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {category.name}
                  </button>
                </div>
                
                {/* Sub-categories */}
                {hasSubCategories && isExpanded && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-border pl-2">
                    {category.subCategories?.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => onSelectCategory(category.id)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start rounded-xl h-10 border-dashed hover:border-solid hover:border-primary hover:bg-primary/5"
          onClick={onManageCategories}
        >
          <Settings className="h-4 w-4 mr-2" />
          Ангилал удирдах
        </Button>
      </div>
    </aside>
  )
}

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddNew: () => void
  categories: Category[]
  selectedDepartment: string
  onDepartmentChange: (dept: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  totalCount: number
  activeCount: number
  onClearFilters: () => void
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  onAddNew,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  activeCount,
  onClearFilters,
}: SearchHeaderProps) {
  const departments = ["IT хэлтэс", "Санхүү хэлтэс", "Хүний нөөцийн хэлтэс", "Борлуулалтын хэлтэс", "Үйл ажиллагааны хэлтэс"]

  return (
    <header className="border-b border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-lg px-3 py-1 text-sm font-medium">
            Нийт: {totalCount}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-lg px-3 py-1 text-sm font-medium">
            Идэвхтэй: {activeCount}
          </Badge>
        </div>
        <Button onClick={onAddNew} className="rounded-xl h-10 px-5 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Шинэ бүртгэл
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Түлхүүр үгээр хайх..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 rounded-xl border-muted-foreground/20 focus:border-primary"
            />
          </div>
        </div>

        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px] h-10 rounded-xl">
            <SelectValue placeholder="Бүх хэлтэс" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх хэлтэс</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px] h-10 rounded-xl">
            <SelectValue placeholder="Бүх төлөв" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх төлөв</SelectItem>
            <SelectItem value="active">Идэвхтэй</SelectItem>
            <SelectItem value="inactive">Идэвхгүй</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Filter className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          onClick={onClearFilters}
          className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </header>
  )
}

interface ErrorTableProps {
  errors: ErrorRecord[]
  categories: Category[]
  onViewImages: (images: string[]) => void
  onSelectError: (error: ErrorRecord) => void
  onEditError: (error: ErrorRecord) => void
  onDeleteError: (error: ErrorRecord) => void
  onToggleStatus: (error: ErrorRecord) => void
}

export function ErrorTable({ 
  errors, 
  categories, 
  onViewImages,
  onSelectError, 
  onEditError, 
  onDeleteError,
  onToggleStatus 
}: ErrorTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)))

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
      month: "numeric",
      day: "numeric",
    })
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Group errors by category
  const groupedErrors = categories.reduce((acc, category) => {
    const categoryErrors = errors.filter(e => e.categoryId === category.id)
    if (categoryErrors.length > 0) {
      acc[category.id] = categoryErrors
    }
    return acc
  }, {} as Record<string, ErrorRecord[]>)

  if (errors.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Хайлтын үр дүн олдсонгүй</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {Object.entries(groupedErrors).map(([categoryId, categoryErrors]) => {
          const isExpanded = expandedCategories.has(categoryId)
          return (
            <div key={categoryId} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-card-foreground">{getCategoryName(categoryId)}</span>
                  <Badge variant="secondary" className="rounded-full text-xs px-2.5 py-0.5">
                    {categoryErrors.length}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Алдааны нэр
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Дэд ангилал
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Хэлтэс
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Шинэчлэгдсэн
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Төлөв
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Хавсралт
                        </th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">
                          Үйлдэл
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categoryErrors.map((error) => {
                        const subCategoryName = getSubCategoryName(error.categoryId, error.subCategoryId)
                        return (
                          <tr key={error.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-card-foreground truncate max-w-[220px]">
                                    {error.keyword}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                    {error.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {subCategoryName ? (
                                <Badge variant="outline" className="rounded-lg text-xs font-normal">
                                  {subCategoryName}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span className="truncate max-w-[100px]">{error.department}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(error.updatedAt)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={error.status === "active" ? "default" : "secondary"}
                                className={cn(
                                  "rounded-lg px-2.5 py-0.5 text-xs font-medium",
                                  error.status === "active"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                                )}
                              >
                                {error.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {error.images.length > 0 ? (
                                <button 
                                  onClick={() => onViewImages(error.images)}
                                  className="group/images flex items-center gap-2 hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"
                                >
                                  <div className="flex -space-x-2">
                                    {error.images.slice(0, 3).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="w-9 h-9 rounded-lg border-2 border-card overflow-hidden shadow-sm group-hover/images:shadow-md transition-shadow"
                                      >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                  {error.images.length > 3 && (
                                    <span className="text-xs text-muted-foreground font-medium">
                                      +{error.images.length - 3}
                                    </span>
                                  )}
                                  <ZoomIn className="h-4 w-4 text-muted-foreground opacity-0 group-hover/images:opacity-100 transition-opacity" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <ImageIcon className="h-4 w-4" />
                                  <span className="text-xs">Байхгүй</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                                  {error.images.length > 0 && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => onViewImages(error.images)}
                                        className="rounded-lg"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Зураг харах
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => onSelectError(error)}
                                    className="rounded-lg"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Дэлгэрэнгүй
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => onEditError(error)}
                                    className="rounded-lg"
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Засах
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onToggleStatus(error)}
                                    className="text-blue-600 focus:text-blue-600 rounded-lg"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    {error.status === "active" ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onDeleteError(error)}
                                    className="text-destructive focus:text-destructive rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Устгах
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
