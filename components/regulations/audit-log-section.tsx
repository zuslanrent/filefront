'use client'

import { useState, useEffect } from 'react'
import { Clock, User, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface AuditLog {
  uuid: string
  file_name: string
  user_name: string
  user_department: string
  action: string
  details: string | null
  created_at: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  upload:     { label: 'Оруулсан',          color: 'bg-blue-100 text-blue-700' },
  view:       { label: 'Үзсэн',             color: 'bg-gray-100 text-gray-600' },
  download:   { label: 'Татсан',            color: 'bg-green-100 text-green-700' },
  update:     { label: 'Зассан',            color: 'bg-yellow-100 text-yellow-700' },
  inactivate: { label: 'Хүчингүй болгосон', color: 'bg-orange-100 text-orange-700' },
  delete:     { label: 'Устгасан',          color: 'bg-red-100 text-red-700' },
}

// Тайлбар шаардлагатай үйлдлүүд
const REQUIRES_DETAILS = ['download', 'inactivate', 'delete']

export function AuditLogSection({ fileId, currentVersion }: { fileId: string; currentVersion: number }) {
  const [logs, setLogs]       = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/audit-logs?file_id=${fileId}`)
      .then(res => res.json())
      .then(data => { if (data.success) setLogs(data.data) })
      .catch(err => console.error('Audit log татахад алдаа:', err))
      .finally(() => setLoading(false))
  }, [fileId])

  if (loading) return <p className="text-sm text-muted-foreground py-4">Уншиж байна...</p>
  if (logs.length === 0) return <p className="text-sm text-muted-foreground py-4">Бүртгэл байхгүй</p>

  return (
    <div className="space-y-3">
      {/* Хувилбарын мэдээлэл */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <span className="text-sm text-muted-foreground">Одоогийн хувилбар:</span>
        <Badge variant="outline" className="font-mono">v{currentVersion}</Badge>
      </div>

      {/* Log жагсаалт */}
      {logs.map(log => {
        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600' }
        const showDetails = REQUIRES_DETAILS.includes(log.action) && log.details

        return (
          <div key={log.uuid} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>
                  {actionInfo.label}
                </span>
                {showDetails && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {log.details}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="size-3" />{log.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="size-3" />{log.user_department}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm', { locale: mn })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}