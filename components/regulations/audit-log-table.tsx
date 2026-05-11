'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Download, 
  Upload, 
  Pencil, 
  Trash2, 
  Ban,
  User,
  Clock,
  FileText,
  Building2,
} from 'lucide-react'
import type { AuditLog } from '@/types/regulations'
import { getDepartmentName } from '@/lib/mock-data/departments'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'
import Link from 'next/link'

interface AuditLogTableProps {
  logs: AuditLog[]
}

function getActionIcon(action: AuditLog['action']) {
  switch (action) {
    case 'view':
      return <Eye className="size-4 text-blue-500" />
    case 'download':
      return <Download className="size-4 text-green-500" />
    case 'upload':
      return <Upload className="size-4 text-purple-500" />
    case 'edit':
      return <Pencil className="size-4 text-orange-500" />
    case 'delete':
      return <Trash2 className="size-4 text-red-500" />
    case 'inactivate':
      return <Ban className="size-4 text-amber-500" />
    default:
      return <FileText className="size-4 text-muted-foreground" />
  }
}

function getActionLabel(action: AuditLog['action']) {
  const labels: Record<AuditLog['action'], string> = {
    view: 'Үзсэн',
    download: 'Татсан',
    upload: 'Оруулсан',
    edit: 'Засварласан',
    delete: 'Устгасан',
    inactivate: 'Хүчингүй болгосон',
  }
  return labels[action]
}

function getActionBadgeVariant(action: AuditLog['action']) {
  switch (action) {
    case 'view':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'download':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'upload':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'edit':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'delete':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'inactivate':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return ''
  }
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">Түүх байхгүй</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Одоогоор бүртгэгдсэн үйлдэл байхгүй байна
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Огноо/Цаг</TableHead>
            <TableHead>Хэрэглэгч</TableHead>
            <TableHead>Хэлтэс</TableHead>
            <TableHead>Үйлдэл</TableHead>
            <TableHead>Файл</TableHead>
            <TableHead>Тайлбар</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm', { locale: mn })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{log.userName}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  {getDepartmentName(log.userDepartment)}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getActionBadgeVariant(log.action)}>
                  <span className="flex items-center gap-1">
                    {getActionIcon(log.action)}
                    {getActionLabel(log.action)}
                  </span>
                </Badge>
              </TableCell>
              <TableCell>
                <Link 
                  href={`/regulations/${log.fileId}`}
                  className="text-sm text-blue-600 hover:underline truncate max-w-[200px] inline-block"
                >
                  {log.fileName}
                </Link>
              </TableCell>
              <TableCell>
                {log.details ? (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                    {log.details}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
