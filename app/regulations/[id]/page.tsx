'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { VersionHistory } from '@/components/regulations/version-history'
import { 
  getRegulationById, 
  formatFileSize, 
  addAuditLog,
  updateRegulation,
  addNotification,
} from '@/lib/mock-data/regulations'
import { getDepartmentName, departments } from '@/lib/mock-data/departments'
import { getCategoryName } from '@/lib/mock-data/categories'
import { getUserName, currentUser, canUserUpload } from '@/lib/mock-data/users'
import type { RegulationFile } from '@/types/regulations'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  File,
  Building2,
  Calendar,
  User,
  Clock,
  Eye,
  Shield,
  History,
  AlertTriangle,
  Ban,
  Loader2,
} from 'lucide-react'

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className="size-12 text-red-500" />
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="size-12 text-green-600" />
    case 'ppt':
    case 'pptx':
      return <Presentation className="size-12 text-orange-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="size-12 text-purple-500" />
    default:
      return <File className="size-12 text-muted-foreground" />
  }
}

export default function RegulationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [regulation, setRegulation] = useState<RegulationFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [inactivateReason, setInactivateReason] = useState('')
  const [isInactivating, setIsInactivating] = useState(false)
  const [showInactivateDialog, setShowInactivateDialog] = useState(false)

  const canEdit = canUserUpload(currentUser)

  useEffect(() => {
    const id = params.id as string
    const data = getRegulationById(id)
    if (data) {
      setRegulation(data)
      // Log view
      addAuditLog({
        fileId: data.id,
        fileName: data.name,
        userId: currentUser.id,
        userName: currentUser.name,
        userDepartment: currentUser.department,
        action: 'view',
        timestamp: new Date(),
      })
    }
    setLoading(false)
  }, [params.id])

  const handleDownload = async () => {
    if (!regulation) return
    
    setIsDownloading(true)
    
    // Log download
    addAuditLog({
      fileId: regulation.id,
      fileName: regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'download',
      timestamp: new Date(),
    })

    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsDownloading(false)
    alert(`${regulation.fileName} татагдлаа (demo)`)
  }

  const handleInactivate = async () => {
    if (!regulation || !inactivateReason) return

    setIsInactivating(true)

    // Update regulation
    updateRegulation(regulation.id, {
      status: 'inactive',
      inactivatedAt: new Date(),
      inactivatedReason: inactivateReason,
    })

    // Log action
    addAuditLog({
      fileId: regulation.id,
      fileName: regulation.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      action: 'inactivate',
      timestamp: new Date(),
      details: inactivateReason,
    })

    // Add notification
    addNotification({
      type: 'inactivate',
      title: 'Журам хүчингүй боллоо',
      message: `${regulation.name} хүчингүй болгогдлоо`,
      fileId: regulation.id,
      createdAt: new Date(),
      read: false,
      targetDepartments: regulation.viewPermissions,
    })

    // Refresh
    setRegulation({
      ...regulation,
      status: 'inactive',
      inactivatedAt: new Date(),
      inactivatedReason: inactivateReason,
    })

    setIsInactivating(false)
    setShowInactivateDialog(false)
    setInactivateReason('')
  }

  const canDownload = regulation?.downloadPermissions.includes(currentUser.department) || currentUser.department === 'it'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!regulation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-16 px-4 max-w-md text-center">
          <FileText className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">Файл олдсонгүй</h1>
          <p className="text-muted-foreground mb-6">
            Хайсан файл байхгүй эсвэл танд харах эрх байхгүй байна
          </p>
          <Button asChild>
            <Link href="/regulations">Буцах</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/regulations">
              <ArrowLeft className="size-4 mr-2" />
              Жагсаалт руу буцах
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {getFileIcon(regulation.fileType)}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-foreground">
                  {regulation.name}
                </h1>
                <Badge
                  className={regulation.status === 'active' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'}
                >
                  {regulation.status === 'active' ? 'Хүчинтэй' : 'Хүчингүй'}
                </Badge>
                <Badge variant="outline">v{regulation.version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{regulation.fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">{regulation.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {canDownload && (
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                Татах
              </Button>
            )}
            
            {canEdit && regulation.status === 'active' && (
              <Dialog open={showInactivateDialog} onOpenChange={setShowInactivateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Ban className="size-4 mr-2" />
                    Хүчингүй болгох
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-amber-500" />
                      Журам хүчингүй болгох
                    </DialogTitle>
                    <DialogDescription>
                      Энэ үйлдлийг буцаах боломжгүй. Журмыг хүчингүй болгосны дараа 
                      хувилбарын түүхэнд хадгалагдана.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Хүчингүй болгох шалтгаан *</Label>
                      <Textarea
                        id="reason"
                        value={inactivateReason}
                        onChange={(e) => setInactivateReason(e.target.value)}
                        placeholder="Шалтгаанаа бичнэ үү..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowInactivateDialog(false)}
                    >
                      Цуцлах
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleInactivate}
                      disabled={!inactivateReason || isInactivating}
                    >
                      {isInactivating && <Loader2 className="size-4 mr-2 animate-spin" />}
                      Хүчингүй болгох
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Inactivated warning */}
        {regulation.status === 'inactive' && regulation.inactivatedReason && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Энэ журам хүчингүй болсон</p>
                  <p className="text-sm text-amber-700 mt-1">{regulation.inactivatedReason}</p>
                  {regulation.inactivatedAt && (
                    <p className="text-xs text-amber-600 mt-2">
                      Хүчингүй болсон: {format(new Date(regulation.inactivatedAt), 'yyyy-MM-dd', { locale: mn })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Дэлгэрэнгүй</TabsTrigger>
            <TabsTrigger value="permissions">Эрхийн мэдээлэл</TabsTrigger>
            <TabsTrigger value="history">
              <History className="size-4 mr-1" />
              Хувилбарын түүх
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-6 md:grid-cols-2">
              {/* File info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Файлын мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Файлын төрөл</span>
                    <span className="font-medium uppercase">{regulation.fileType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Хэмжээ</span>
                    <span className="font-medium">{formatFileSize(regulation.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Хувилбар</span>
                    <Badge variant="outline">v{regulation.version}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Regulation info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Журмын мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Бүлэг:</span>
                    <span className="font-medium">{getCategoryName(regulation.category)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Хариуцсан хэлтэс:</span>
                    <span className="font-medium">{getDepartmentName(regulation.department)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Батлагдсан:</span>
                    <span className="font-medium">
                      {format(new Date(regulation.approvedDate), 'yyyy-MM-dd', { locale: mn })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Оруулсан:</span>
                    <span className="font-medium">{getUserName(regulation.uploadedBy)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Оруулсан огноо:</span>
                    <span className="font-medium">
                      {format(new Date(regulation.uploadedAt), 'yyyy-MM-dd HH:mm', { locale: mn })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="grid gap-6 md:grid-cols-2">
              {/* View permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="size-4" />
                    Харах эрхтэй хэлтсүүд
                  </CardTitle>
                  <CardDescription>
                    Эдгээр хэлтсүүд файлыг жагсаалтаас харах боломжтой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {regulation.viewPermissions.map((deptId) => (
                      <Badge key={deptId} variant="secondary">
                        {getDepartmentName(deptId)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Download permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="size-4" />
                    Татах эрхтэй хэлтсүүд
                  </CardTitle>
                  <CardDescription>
                    Эдгээр хэлтсүүд файлыг татаж авах боломжтой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {regulation.downloadPermissions.map((deptId) => (
                      <Badge key={deptId} variant="secondary">
                        {getDepartmentName(deptId)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Хувилбарын түүх</CardTitle>
                <CardDescription>
                  Журмын бүх хувилбарууд болон өөрчлөлтийн түүх
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VersionHistory
                  currentVersion={regulation.version}
                  previousVersions={regulation.previousVersions}
                  currentFile={regulation}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
