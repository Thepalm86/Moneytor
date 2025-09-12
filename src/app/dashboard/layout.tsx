import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Moneytor',
  description: 'Manage your finances with Moneytor',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}