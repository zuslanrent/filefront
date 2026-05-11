'use client'

import { useState } from 'react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from 'lucide-react'
import type { RegulationFile } from '@/types/regulations'
import { getDepartmentName } from '@/lib/mock-data/departments'
import { formatFileSize, addAuditLog } from '@/lib/mock-data/regulations'
import { currentUser } from '@/lib/mock-data/users'

interface RegulationsTableProps {
  regulations: RegulationFile[]
  userDepartment: string
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

export function RegulationsTable({ regulations, userDepartment }: RegulationsTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleView = (regulation: RegulationFile) => {
    // Log view action
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
    if (!regulation.downloadPermissions.includes(userDepartment)) {
      return
    }

    setDownloadingId(regulation.id)
    
    // Log download action
    addAuditLog({
      fileId: regulation.id,
      fileName: regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'download',
      timestamp: new Date(),
    })

    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setDownloadingId(null)
    
    // In a real app, this would download the actual file
    alert(`${regulation.fileName} татагдлаа (demo)`)
  }

  const canView = (regulation: RegulationFile) => {
    return regulation.viewPermissions.includes(userDepartment) || userDepartment === 'it'
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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Файлын нэр</TableHead>
            <TableHead>Хэлтэс</TableHead>
            <TableHead>Батлагдсан</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead>Хэмжээ</TableHead>
            <TableHead className="text-right">Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regulations.map((regulation) => {
            const viewable = canView(regulation)
            const downloadable = canDownload(regulation)

            if (!viewable) return null

            return (
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
                          Дэлгэрэнгүй харах
                        </Link>
                      </DropdownMenuItem>
                      {downloadable && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(regulation)}
                          disabled={downloadingId === regulation.id}
                        >
                          <Download className="size-4 mr-2" />
                          {downloadingId === regulation.id ? 'Татаж байна...' : 'Татах'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
