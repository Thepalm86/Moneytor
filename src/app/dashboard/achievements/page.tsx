import { Metadata } from 'next';
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout';
import { AchievementsTab } from '@/components/dashboard/achievements-tab';

export const metadata: Metadata = {
  title: 'Achievements | Moneytor',
  description: 'Track your financial achievements, earn badges, and celebrate your progress toward better money management.',
};

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AchievementsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Achievements"
        description="Celebrate your financial journey with badges and milestones that recognize your money management progress."
        actions={null}
      >
        <ContentArea>
          <AchievementsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  );
}