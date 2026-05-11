'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  File,
  Download,
  Eye,
  MoreHorizontal,
  Clock,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Edit,
  Trash2,
  XCircle,
  Info,
} from 'lucide-react'
import type { RegulationFile, Category } from '@/types/regulations'
import { getDepartmentName } from '@/lib/mock-data/departments'
import { formatFileSize, addAuditLog } from '@/lib/mock-data/regulations'
import { getCategoryName } from '@/lib/mock-data/categories'
import { currentUser } from '@/lib/mock-data/users'

interface RegulationsGroupedTableProps {
  regulations: RegulationFile[]
  categories: Category[]
  userDepartment: string
  canManage: boolean
  onEdit?: (regulation: RegulationFile) => void
  onDelete?: (regulation: RegulationFile) => void
  onDeactivate?: (regulation: RegulationFile) => void
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className="size-5 text-red-500" />
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="size-5 text-green-600" />
    case 'ppt':
    case 'pptx':
      return <Presentation className="size-5 text-orange-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="size-5 text-blue-500" />
    default:
      return <File className="size-5 text-muted-foreground" />
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

  // Group regulations by category
  const groupedRegulations = useMemo(() => {
    const grouped: Record<string, RegulationFile[]> = {}
    
    categories.forEach(cat => {
      grouped[cat.id] = regulations.filter(r => r.category === cat.id)
    })
    
    // Add uncategorized
    const uncategorized = regulations.filter(
      r => !categories.some(c => c.id === r.category)
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
    addAuditLog({
      fileId: regulation.id,
      fileName: regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'view',
      timestamp: new Date(),
    })
  }

  const handleDownload = async (regulation: RegulationFile) => {
    if (!regulation.downloadPermissions.includes(userDepartment) && userDepartment !== 'it') {
      return
    }

    setDownloadingId(regulation.id)
    
    addAuditLog({
      fileId: regulation.id,
      fileName: regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'download',
      timestamp: new Date(),
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    setDownloadingId(null)
    
    alert(`${regulation.fileName} татагдлаа (demo)`)
  }

  const canDownload = (regulation: RegulationFile) => {
    return regulation.downloadPermissions.includes(userDepartment) || userDepartment === 'it'
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
      ? [{ id: 'uncategorized', name: 'Бусад', description: '', order: 999 }] 
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
                    {isOpen ? (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                    <FolderOpen className="size-5 text-primary" />
                    <span className="font-semibold">{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {categoryRegulations.length}
                    </Badge>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
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
                            <span className="text-sm">{getDepartmentName(regulation.department)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(regulation.approvedDate).toLocaleDateString('mn-MN')}
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
                                <Link
                                  href={`/regulations/${regulation.id}`}
                                  onClick={() => handleView(regulation)}
                                >
                                  <Eye className="size-4 mr-2" />
                                  Харах
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/regulations/${regulation.id}`}>
                                  <Info className="size-4 mr-2" />
                                  Бүртгэлийн дэлгэрэнгүй
                                </Link>
                              </DropdownMenuItem>
                              {canDownload(regulation) && (
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
                                    <Edit className="size-4 mr-2" />
                                    Засах
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onDeactivate?.(regulation)}
                                    className="text-orange-600"
                                  >
                                    <XCircle className="size-4 mr-2" />
                                    Идэвхгүй болгох
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onDelete?.(regulation)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="size-4 mr-2" />
                                    Устгах
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
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}
