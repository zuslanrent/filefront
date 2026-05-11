'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileUploadZone } from './file-upload-zone'
import { PermissionSelector } from './permission-selector'
import { NotificationSelector, type NotificationConfig } from './notification-selector'
import { departments } from '@/lib/mock-data/departments'
import { getCategories } from '@/lib/mock-data/categories'
import { currentUser } from '@/lib/mock-data/users'
import { addRegulation, addAuditLog, addNotification } from '@/lib/mock-data/regulations'
import type { RegulationFile, Category } from '@/types/regulations'
import { CalendarIcon, Loader2, ArrowLeft, User, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'
import Link from 'next/link'

export function UploadForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  // Form state
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [category, setCategory] = useState('')
  const [approvedDate, setApprovedDate] = useState<Date>()
  const [description, setDescription] = useState('')
  const [viewPermissions, setViewPermissions] = useState<string[]>([])
  const [downloadPermissions, setDownloadPermissions] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    type: 'all',
    departments: [],
    users: [],
    groupEmail: '',
  })

  useEffect(() => {
    setCategories(getCategories())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !department || !category || !approvedDate || files.length === 0) {
      alert('Бүх талбарыг бөглөнө үү')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create regulation for each file
      for (const file of files) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
        
        const newRegulation: RegulationFile = {
          id: `reg${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          fileName: file.name,
          fileType: fileExtension,
          fileSize: file.size,
          fileUrl: `/mock-files/${file.name}`,
          department,
          category,
          approvedDate,
          uploadedBy: currentUser.id,
          uploadedAt: new Date(),
          description,
          viewPermissions: viewPermissions.length > 0 ? viewPermissions : departments.map(d => d.id),
          downloadPermissions: downloadPermissions.length > 0 ? downloadPermissions : [currentUser.department],
          status: 'active',
          version: 1,
          previousVersions: [],
          updatedAt: new Date(),
        }

        // Add to storage
        addRegulation(newRegulation)

        // Add audit log
        addAuditLog({
          fileId: newRegulation.id,
          fileName: newRegulation.name,
          userId: currentUser.id,
          userName: currentUser.name,
          userDepartment: currentUser.department,
          action: 'upload',
          timestamp: new Date(),
          details: `Шинэ журам нэмэгдлээ: ${name}`,
        })

        // Add notification based on config
        const notification = {
          type: 'new_regulation' as const,
          title: 'Шинэ журам нэмэгдлээ',
          message: `${name} - ${file.name}`,
          fileId: newRegulation.id,
          createdAt: new Date(),
          read: false,
          targetDepartments: notificationConfig.type === 'all' 
            ? departments.map(d => d.id)
            : notificationConfig.type === 'departments'
              ? notificationConfig.departments
              : [],
          targetUsers: notificationConfig.type === 'users' ? notificationConfig.users : undefined,
          notifyAll: notificationConfig.type === 'all',
          notifyEmail: notificationConfig.type === 'email' ? notificationConfig.groupEmail : undefined,
        }

        addNotification(notification)
      }

      // Redirect to regulations list
      router.push('/regulations')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/regulations">
            <ArrowLeft className="size-4 mr-2" />
            Буцах
          </Link>
        </Button>
      </div>

      {/* File upload */}
      <Card>
        <CardHeader>
          <CardTitle>Файл оруулах</CardTitle>
          <CardDescription>
            Олон файл нэгэн зэрэг сонгох боломжтой (PDF, DOC, PPT, зураг гэх мэт)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone files={files} onFilesChange={setFiles} />
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Үндсэн мэдээлэл</CardTitle>
          <CardDescription>
            Журмын нэр, бүлэг болон хариуцсан хэлтэс
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Regulation name */}
          <div className="space-y-2">
            <Label htmlFor="name">Журмын нэр *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Жишээ: Ажилтны ёс зүйн дүрэм"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Бүлэг *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Бүлэг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Хариуцсан хэлтэс *</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Хэлтэс сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Approved date */}
          <div className="space-y-2">
            <Label>Батлагдсан огноо *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {approvedDate ? (
                    format(approvedDate, 'yyyy-MM-dd', { locale: mn })
                  ) : (
                    <span className="text-muted-foreground">Огноо сонгох</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={approvedDate}
                  onSelect={setApprovedDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Журмын товч тайлбар..."
              rows={3}
            />
          </div>

          {/* Auto-filled fields */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>Хэн оруулсан: <span className="text-foreground font-medium">{currentUser.name}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>Хэзээ: <span className="text-foreground font-medium">{format(new Date(), 'yyyy-MM-dd HH:mm', { locale: mn })}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Эрхийн тохиргоо</CardTitle>
          <CardDescription>
            Аль хэлтсүүд энэ файлыг харах, татах боломжтойг тохируулна
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PermissionSelector
            title="Харах эрх"
            description="Эдгээр хэлтсүүд файлыг жагсаалтаас харж, дэлгэрэнгүй мэдээлэл үзэх боломжтой"
            selectedDepartments={viewPermissions}
            onSelectionChange={setViewPermissions}
          />

          <PermissionSelector
            title="Татах эрх"
            description="Эдгээр хэлтсүүд файлыг татаж авах боломжтой"
            selectedDepartments={downloadPermissions}
            onSelectionChange={setDownloadPermissions}
          />
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Мэдэгдлийн тохиргоо</CardTitle>
          <CardDescription>
            Шинэ журам нэмэгдсэн тухай хэнд мэдэгдэл илгээхийг тохируулна
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSelector
            value={notificationConfig}
            onChange={setNotificationConfig}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href="/regulations">Цуцлах</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || files.length === 0}>
          {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
      </div>
    </form>
  )
}
