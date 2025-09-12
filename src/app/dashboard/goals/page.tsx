import { Metadata } from 'next';
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout';
import { GoalsTab } from '@/components/dashboard/goals-tab';

export const metadata: Metadata = {
  title: 'Saving Goals | Moneytor',
  description: 'Track and manage your saving goals with progress monitoring and milestone achievements.',
};

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Saving Goals"
        description="Set, track, and achieve your financial savings objectives with smart goal management."
        actions={null}
      >
        <ContentArea>
          <GoalsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  );
}