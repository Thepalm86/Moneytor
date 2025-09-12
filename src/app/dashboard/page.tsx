'use client';

import * as React from 'react'
import { useEffect, useState } from 'react'
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { useNavigationStore } from '@/lib/stores/navigation-store'
import { useStoreHydration } from '@/lib/hooks/use-store-hydration'
import { 
  OverviewTab,
  CategoriesTab,
  TransactionsTab,
  TargetsTab,
  GoalsTab,
  ReportsTab,
  DashboardLoading
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
  const isHydrated = useStoreHydration()
  const { activeTab, setIsHydrated } = useNavigationStore()
  
  // Ensure store knows it's hydrated
  useEffect(() => {
    if (isHydrated) {
      setIsHydrated(true)
    }
  }, [isHydrated, setIsHydrated])

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <DashboardLayout>
        <PageWrapper 
          title="Dashboard"
          description="Loading your financial overview..."
        >
          <ContentArea>
            <DashboardLoading />
          </ContentArea>
        </PageWrapper>
      </DashboardLayout>
    )
  }

  // Get current tab configuration (only after hydration)
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