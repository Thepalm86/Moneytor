'use client';

import * as React from 'react'
import { Section } from '@/components/layout'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { MonthlyTrends } from '@/components/dashboard/monthly-trends'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { BudgetProgress, SavingGoalsProgress } from '@/components/dashboard/progress-indicators'

export function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Financial Overview Cards */}
      <Section 
        title="Financial Overview"
        description="Your key financial metrics at a glance"
      >
        <OverviewCards />
      </Section>

      {/* Quick Actions */}
      <Section>
        <QuickActions />
      </Section>

      {/* Monthly Trends & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <MonthlyTrends />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>

      {/* Budget Progress */}
      <Section>
        <BudgetProgress />
      </Section>

      {/* Savings Goals */}
      <Section>
        <SavingGoalsProgress />
      </Section>
    </div>
  )
}