'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, FileText, History } from 'lucide-react'
import { canUserUpload, currentUser } from '@/lib/mock-data/users'

interface RegulationsHeaderProps {
  totalCount: number
  activeCount: number
  canUpload?: boolean
}

export function RegulationsHeader({ totalCount, activeCount, canUpload }: RegulationsHeaderProps) {
  const userCanUpload = canUpload ?? canUserUpload(currentUser)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100">
            <FileText className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Дүрэм журам</h1>
            <p className="text-sm text-muted-foreground">
              Байгууллагын дүрэм, журам, бодлогын сан 
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Badge variant="outline" className="bg-background">
            Нийт: {totalCount}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Хүчинтэй: {activeCount}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/regulations/audit-log">
            <History className="size-4 mr-2" />
            Audit Log
          </Link>
        </Button>
        
        <Button variant="outline" size="sm">
          <Bell className="size-4 mr-2" />
          Notification
        </Button>

        {userCanUpload && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/regulations/upload">
              <Plus className="size-4 mr-2" />
              Шинэ журам
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
