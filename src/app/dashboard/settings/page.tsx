import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { SettingsContent } from '@/components/settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Settings"
        description="Manage your account preferences, security settings, and application configuration."
        actions={null}
      >
        <ContentArea>
          <SettingsContent />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}