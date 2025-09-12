import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { CategoriesTab } from '@/components/dashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Categories"
        description="Organize your transactions with custom categories"
        actions={null}
      >
        <ContentArea>
          <CategoriesTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}