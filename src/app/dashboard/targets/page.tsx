import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { TargetsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Plus } from 'lucide-react'

export default function TargetsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Budget Targets"
        description="Set and track your spending goals"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Target
          </Button>
        }
      >
        <ContentArea>
          <TargetsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}