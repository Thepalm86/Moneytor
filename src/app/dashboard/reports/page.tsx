import { Metadata } from 'next';
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout';
import { ReportsTab } from '@/components/dashboard/reports-tab';

export const metadata: Metadata = {
  title: 'Reports & Analytics | Moneytor',
  description: 'Analyze your financial data with comprehensive reports and interactive charts.',
};

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <PageWrapper 
        title="Reports & Analytics"
        description="Gain insights into your financial patterns with comprehensive analytics and interactive visualizations."
        actions={null}
      >
        <ContentArea>
          <ReportsTab />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  );
}