'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Download, Clock, User, FileText } from 'lucide-react'
import type { PreviousVersion, RegulationFile } from '@/types/regulations'
import { getUserName } from '@/lib/mock-data/users'
import { format } from 'date-fns'
import { mn } from 'date-fns/locale'

interface VersionHistoryProps {
  currentVersion: number
  previousVersions: PreviousVersion[]
  currentFile: RegulationFile
}

export function VersionHistory({ 
  currentVersion, 
  previousVersions,
  currentFile 
}: VersionHistoryProps) {
  const allVersions = [
    {
      id: currentFile.id,
      version: currentVersion,
      fileName: currentFile.fileName,
      fileUrl: currentFile.fileUrl,
      uploadedAt: currentFile.uploadedAt,
      uploadedBy: currentFile.uploadedBy,
      isCurrent: true,
    },
    ...previousVersions.map((v) => ({
      ...v,
      isCurrent: false,
    })),
  ]

  if (previousVersions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="size-10 mx-auto mb-3 opacity-50" />
        <p>Өмнөх хувилбар байхгүй байна</p>
        <p className="text-sm">Энэ бол анхны хувилбар</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Хувилбар</TableHead>
              <TableHead>Файлын нэр</TableHead>
              <TableHead>Оруулсан огноо</TableHead>
              <TableHead>Оруулсан</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVersions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>
                  <Badge variant={version.isCurrent ? 'default' : 'secondary'}>
                    v{version.version}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {version.fileName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" />
                    {format(new Date(version.uploadedAt), 'yyyy-MM-dd HH:mm', { locale: mn })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="size-3.5 text-muted-foreground" />
                    {getUserName(version.uploadedBy)}
                  </div>
                </TableCell>
                <TableCell>
                  {version.isCurrent ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Одоогийн
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Хуучин
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="size-4 mr-1" />
                    Татах
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Inactivation info for previous versions */}
      {previousVersions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Хүчингүй болгосон мэдээлэл</h4>
          {previousVersions.map((version) => (
            <div 
              key={version.id}
              className="p-3 bg-muted/50 rounded-lg border text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Хувилбар {version.version}</span>
                <span className="text-muted-foreground">
                  {format(new Date(version.inactivatedAt), 'yyyy-MM-dd', { locale: mn })}
                </span>
              </div>
              <p className="text-muted-foreground">{version.inactivatedReason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
