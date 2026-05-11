'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UploadForm } from '@/components/regulations/upload-form'
import { canUserUpload, currentUser } from '@/lib/mock-data/users'
import { FileText, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const canUpload = canUserUpload(currentUser)

  useEffect(() => {
    // Redirect if user doesn't have upload permission
    if (!canUpload) {
      // Don't redirect, show message instead
    }
  }, [canUpload, router])

  if (!canUpload) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-16 px-4 max-w-md text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-red-100 mx-auto mb-6">
            <ShieldAlert className="size-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Эрх хүрэлцэхгүй байна
          </h1>
          <p className="text-muted-foreground mb-6">
            Зөвхөн IT хэлтэс файл оруулах эрхтэй. Таны одоогийн хэлтэс: {currentUser.department.toUpperCase()}
          </p>
          <Button asChild>
            <Link href="/regulations">
              Жагсаалт руу буцах
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100">
            <FileText className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Шинэ журам нэмэх</h1>
            <p className="text-sm text-muted-foreground">
              Байгууллагын дүрэм, журам оруулах
            </p>
          </div>
        </div>

        {/* Form */}
        <UploadForm />
      </div>
    </div>
  )
}
