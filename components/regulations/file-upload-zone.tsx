'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image, 
  File,
  X,
  CheckCircle2,
} from 'lucide-react'
import { formatFileSize } from '@/lib/mock-data/regulations'

interface FileUploadZoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

function getFileIcon(file: File) {
  const type = file.type
  if (type === 'application/pdf') {
    return <FileText className="size-8 text-red-500" />
  }
  if (type.includes('word') || type.includes('document')) {
    return <FileText className="size-8 text-blue-500" />
  }
  if (type.includes('excel') || type.includes('spreadsheet')) {
    return <FileSpreadsheet className="size-8 text-green-600" />
  }
  if (type.includes('powerpoint') || type.includes('presentation')) {
    return <Presentation className="size-8 text-orange-500" />
  }
  if (type.startsWith('image/')) {
    return <Image className="size-8 text-purple-500" />
  }
  return <File className="size-8 text-muted-foreground" />
}

export function FileUploadZone({ 
  files, 
  onFilesChange, 
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024 // 50MB
}: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Simulate upload progress for each file
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    
    acceptedFiles.forEach((file) => {
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: Math.min(progress, 100),
        }))
        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 100)
    })

    onFilesChange(newFiles)
  }, [files, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: maxFiles - files.length,
    maxSize,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-border hover:border-blue-400 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-14 rounded-full bg-blue-100">
            <Upload className="size-7 text-blue-600" />
          </div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Файлаа энд тавина уу...</p>
          ) : (
            <>
              <div>
                <p className="font-medium text-foreground">
                  Файл чирж оруулах эсвэл сонгох
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG (50MB хүртэл)
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                Файл сонгох
              </Button>
            </>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Сонгосон файлууд ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => {
              const progress = uploadProgress[file.name] || 100
              const isComplete = progress === 100

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {!isComplete && (
                      <Progress value={progress} className="h-1 mt-2" />
                    )}
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
