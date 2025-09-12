'use client';

import * as React from 'react'
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { useNavigationStore } from '@/lib/stores/navigation-store'
import { 
  OverviewTab,
  CategoriesTab,
  TransactionsTab,
  TargetsTab,
  GoalsTab,
  ReportsTab
} from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const tabConfig = {
  overview: {
    title: 'Dashboard',
    description: 'Welcome back! Here\'s an overview of your financial activity.',
    component: OverviewTab,
    action: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
    )
  },
  transactions: {
    title: 'Transactions',
    description: 'Manage your income and expenses',
    component: TransactionsTab,
    action: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
    )
  },
  categories: {
    title: 'Categories',
    description: 'Organize your transactions with custom categories',
    component: CategoriesTab,
    action: null // Categories tab has its own action button
  },
  targets: {
    title: 'Budget Targets',
    description: 'Set and track your spending goals',
    component: TargetsTab,
    action: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Target
      </Button>
    )
  },
  goals: {
    title: 'Saving Goals',
    description: 'Track your savings progress',
    component: GoalsTab,
    action: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Goal
      </Button>
    )
  },
  reports: {
    title: 'Reports & Analytics',
    description: 'Detailed financial analysis and insights',
    component: ReportsTab,
    action: (
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
    )
  }
}

export default function DashboardPage() {
  const { activeTab } = useNavigationStore()
  
  // Get current tab configuration
  const currentTab = tabConfig[activeTab as keyof typeof tabConfig] || tabConfig.overview
  const TabComponent = currentTab.component

  return (
    <DashboardLayout>
      <PageWrapper 
        title={currentTab.title}
        description={currentTab.description}
        actions={currentTab.action}
      >
        <ContentArea>
          <TabComponent />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}