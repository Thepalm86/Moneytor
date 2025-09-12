import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { GoalsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Plus } from 'lucide-react'

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Saving Goals"
        description="Track your savings progress"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        }
      >
        <ContentArea>
          <GoalsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}