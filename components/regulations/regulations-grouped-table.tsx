'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FileText, FileSpreadsheet, Presentation, Image, File,
  Download, Eye, MoreHorizontal, Clock, Building2,
  ChevronDown, ChevronRight, FolderOpen, Edit, Trash2, XCircle, Info,
} from 'lucide-react'
import type { RegulationFile, Category } from '@/types/regulations'
import { currentUser } from '@/lib/mock-data/users'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface RegulationsGroupedTableProps {
  regulations: RegulationFile[]  // ← RegulationFile төрлийг ашиглах
  categories: Category[]
  userDepartment: string
  canManage: boolean
  onEdit?: (regulation: RegulationFile) => void
  onDelete?: (regulation: RegulationFile) => void
  onDeactivate?: (regulation: RegulationFile) => void
}

// formatFileSize mock import-г устгаж дотроо тодорхойлно
function formatFileSize(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getFileIcon(fileType: string) {
  const type = fileType?.toLowerCase() || ''
  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx': return <FileText className="size-5 text-red-500" />
    case 'xls':
    case 'xlsx': return <FileSpreadsheet className="size-5 text-green-600" />
    case 'ppt':
    case 'pptx': return <Presentation className="size-5 text-orange-500" />
    case 'png':
    case 'jpg':
    case 'jpeg': 
    case 'image': return <Image className="size-5 text-blue-500" />
    default: return <File className="size-5 text-muted-foreground" />
  }
}

// API руу audit log бичих
async function postAuditLog(payload: {
  file_id: string
  file_name: string
  user_id: string
  user_name: string
  user_department: string
  action: string
  details?: string
}) {
  try {
    await fetch(`${API_URL}/api/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('Audit log бичихэд алдаа:', err)
  }
}

export function RegulationsGroupedTable({
  regulations,
  categories,
  userDepartment,
  canManage,
  onEdit,
  onDelete,
  onDeactivate,
}: RegulationsGroupedTableProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(
    categories.map(c => c.id)
  )
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Бүлэглэлт: category -аар бүлэглэх
  const groupedRegulations = useMemo(() => {
    const grouped: Record<string, RegulationFile[]> = {}
    
    // Бүлэг тус бүрт тохирох журамуудыг хийх
    categories.forEach(cat => {
      grouped[cat.id] = regulations.filter(r => r.category === cat.id)
    })
    
    // Бусад (category нь ямар ч бүлэгт тохирохгүй)
    const uncategorized = regulations.filter(
      r => !r.category || !categories.some(c => c.id === r.category)
    )
    if (uncategorized.length > 0) {
      grouped['uncategorized'] = uncategorized
    }
    
    return grouped
  }, [regulations, categories])

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleView = (regulation: RegulationFile) => {
    postAuditLog({
      file_id: regulation.id,
      file_name: regulation.name,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_department: currentUser.department,
      action: 'view',
    })
  }

  const handleDownload = async (regulation: RegulationFile) => {
    if (!canDownload(regulation)) {
      console.warn('Татаж авах эрхгүй')
      return
    }

    setDownloadingId(regulation.id)

    postAuditLog({
      file_id: regulation.id,
      file_name: regulation.name,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_department: currentUser.department,
      action: 'download',
    })

    // Файл татах (хэрэв fileUrl байвал)
    if (regulation.fileUrl) {
      try {
        const response = await fetch(regulation.fileUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = regulation.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Файл татахад алдаа:', error)
      }
    } else {
      console.warn('fileUrl байхгүй байна')
    }

    setTimeout(() => setDownloadingId(null), 500)
  }

  const canDownload = (regulation: RegulationFile) => {
    // downloadPermissions ашиглах
    if (regulation.downloadPermissions && regulation.downloadPermissions.length > 0) {
      return regulation.downloadPermissions.includes(userDepartment) || userDepartment === 'it'
    }
    // default: department-аар шалгах
    return regulation.department === userDepartment || userDepartment === 'it'
  }

  if (regulations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">Дүрэм журам олдсонгүй</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Хайлтын үр дүн олдсонгүй эсвэл танд харах эрх байхгүй байна
        </p>
      </div>
    )
  }

  const allCategories = [
    ...categories,
    ...(groupedRegulations['uncategorized']?.length
      ? [{ 
          id: 'uncategorized', 
          name: 'Бусад', 
          description: '', 
          order: 999, 
          parentId: null, 
          createdAt: '', 
          updatedAt: '' 
        }]
      : [])
  ]

  return (
    <div className="space-y-4">
      {allCategories.map(category => {
        const categoryRegulations = groupedRegulations[category.id] || []
        if (categoryRegulations.length === 0) return null

        const isOpen = openCategories.includes(category.id)

        return (
          <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <div className="border rounded-lg overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left">
                  <div className="flex items-center gap-3">
                    {isOpen
                      ? <ChevronDown className="size-5 text-muted-foreground" />
                      : <ChevronRight className="size-5 text-muted-foreground" />}
                    <FolderOpen className="size-5 text-primary" />
                    <span className="font-semibold">{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {categoryRegulations.length}
                    </Badge>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[35%]">Файлын нэр</TableHead>
                        <TableHead>Хэлтэс</TableHead>
                        <TableHead>Батлагдсан огноо</TableHead>
                        <TableHead>Төлөв</TableHead>
                        <TableHead>Хэмжээ</TableHead>
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryRegulations.map(regulation => (
                        <TableRow key={regulation.id}>
                          <TableCell>
                            <Link
                              href={`/regulations/${regulation.id}`}
                              onClick={() => handleView(regulation)}
                              className="flex items-center gap-3 hover:underline"
                            >
                              {getFileIcon(regulation.fileType)}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{regulation.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {regulation.fileName}
                                </p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-muted-foreground" />
                              <span className="text-sm">{regulation.department || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {regulation.approvedDate
                                  ? new Date(regulation.approvedDate).toLocaleDateString('mn-MN')
                                  : '—'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={regulation.status === 'active' ? 'default' : 'secondary'}
                              className={regulation.status === 'active'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'}
                            >
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                regulation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              {regulation.status === 'active' ? 'Хүчинтэй' : 'Хүчингүй'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatFileSize(regulation.fileSize)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/regulations/${regulation.id}`} onClick={() => handleView(regulation)}>
                                    <Eye className="size-4 mr-2" />Харах
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/regulations/${regulation.id}`}>
                                    <Info className="size-4 mr-2" />Бүртгэлийн дэлгэрэнгүй
                                  </Link>
                                </DropdownMenuItem>
                                {canDownload(regulation) && regulation.fileUrl && (
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(regulation)}
                                    disabled={downloadingId === regulation.id}
                                  >
                                    <Download className="size-4 mr-2" />
                                    {downloadingId === regulation.id ? 'Татаж байна...' : 'Татах'}
                                  </DropdownMenuItem>
                                )}
                                {canManage && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onEdit?.(regulation)}>
                                      <Edit className="size-4 mr-2" />Засах
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDeactivate?.(regulation)}
                                      className="text-orange-600"
                                    >
                                      <XCircle className="size-4 mr-2" />Идэвхгүй болгох
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete?.(regulation)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="size-4 mr-2" />Устгах
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}