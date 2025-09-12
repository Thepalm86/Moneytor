import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { ReportsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Reports & Analytics"
        description="Detailed financial analysis and insights"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        }
      >
        <ContentArea>
          <ReportsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}