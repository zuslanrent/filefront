'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Clock, ArrowLeft, User, Building2, Search } from 'lucide-react'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DEPT_URL = 'http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79'

interface AuditLog {
  uuid: string
  file_id: string
  file_name: string
  user_id: string
  user_name: string
  user_department: string
  action: string
  details: string
  created_at: string
}

interface Department {
  id: string | number
  name: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  upload:     { label: 'Оруулсан',        color: 'bg-blue-100 text-blue-700' },
  view:       { label: 'Үзсэн',           color: 'bg-gray-100 text-gray-600' },
  download:   { label: 'Татсан',          color: 'bg-green-100 text-green-700' },
  update:     { label: 'Зассан',          color: 'bg-yellow-100 text-yellow-700' },
  inactivate: { label: 'Хүчингүй болгосон', color: 'bg-orange-100 text-orange-700' },
  delete:     { label: 'Устгасан',        color: 'bg-red-100 text-red-700' },
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [action, setAction] = useState('all')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)                params.append('search', search)
      if (department !== 'all') params.append('department', department)
      if (action !== 'all')     params.append('action', action)

      const res  = await fetch(`${API_URL}/api/audit-logs?${params}`)
      const data = await res.json()
      if (data.success) setLogs(data.data)
    } catch (err) {
      console.error('Audit log татахад алдаа:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetch(DEPT_URL)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data ?? []
        setDepartments(list)
      })
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [department, action])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/regulations"><ArrowLeft className="size-4 mr-2" />Жагсаалт руу буцах</Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100">
              <Clock className="size-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Audit Log</h1>
              <p className="text-sm text-muted-foreground">Хэн, хэзээ, ямар файл үзсэн/татсан/зассан</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl p-4 mb-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground">Түүх шүүлтүүр</h2>
          <p className="text-xs text-muted-foreground">Ажилтнуудын жагсаалтаас сонгож аудит лог харах</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Файл эсвэл хэрэглэгчээр хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                className="pl-9"
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Building2 className="size-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Бүх хэлтэс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх хэлтэс</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Бүх үйлдэл" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх үйлдэл</SelectItem>
                <SelectItem value="upload">Оруулсан</SelectItem>
                <SelectItem value="view">Үзсэн</SelectItem>
                <SelectItem value="download">Татсан</SelectItem>
                <SelectItem value="update">Зассан</SelectItem>
                <SelectItem value="inactivate">Хүчингүй болгосон</SelectItem>
                <SelectItem value="delete">Устгасан</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">Нийт {logs.length} бүртгэл</p>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Огноо/Цаг</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Хэрэглэгч</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Хэлтэс</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Үйлдэл</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Файл</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Тайлбар</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Уншиж байна...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Бүртгэл байхгүй</td></tr>
                ) : (
                  logs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <tr key={log.uuid} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm', { locale: mn })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                              {log.user_name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium">{log.user_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="size-3.5" />
                            {log.user_department?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {log.file_name || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {log.details || '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}