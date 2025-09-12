import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { TransactionsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Plus } from 'lucide-react'

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Transactions"
        description="Manage your income and expenses"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        }
      >
        <ContentArea>
          <TransactionsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}