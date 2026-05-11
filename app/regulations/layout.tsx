import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Дүрэм журам - Intranet',
  description: 'Байгууллагын дүрэм, журам, бодлогын сан',
}

export default function RegulationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
