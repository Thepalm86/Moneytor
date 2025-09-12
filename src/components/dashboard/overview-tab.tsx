'use client';

import * as React from 'react'
import { motion } from 'framer-motion'
import { Section } from '@/components/layout'
import { EnhancedOverviewCards } from '@/components/dashboard/enhanced-overview-cards'
import { SmartQuickActions } from '@/components/dashboard/smart-quick-actions'
import { MonthlyTrends } from '@/components/dashboard/monthly-trends'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UnifiedProgressHub } from '@/components/dashboard/unified-progress-hub'
import { SmartInsightsPanel } from '@/components/dashboard/smart-insights-panel'
import { useStaggerAnimation } from '@/hooks/use-animation-persistence'

export function OverviewTab() {
  const staggerAnimation = useStaggerAnimation('dashboard-overview', 6)

  return (
    <motion.div 
      className="space-y-6"
      {...staggerAnimation.container}
    >
      {/* 📊 PRIMARY METRICS - Enhanced Overview Cards (3-card layout) */}
      <motion.div {...staggerAnimation.child}>
        <Section 
          title="Financial Overview"
          description="Your key financial metrics and performance indicators"
          className="space-y-4"
        >
          <EnhancedOverviewCards />
        </Section>
      </motion.div>

      {/* ⚡ CONTEXTUAL QUICK ACTIONS - Smart Recommendations */}
      <motion.div {...staggerAnimation.child}>
        <SmartQuickActions />
      </motion.div>

      {/* 📈 INSIGHTS SECTION - Monthly Trends & Recent Activity */}
      <motion.div 
        {...staggerAnimation.child}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <MonthlyTrends />
        </div>
        <div className="space-y-4">
          <RecentTransactions />
        </div>
      </motion.div>

      {/* 🎯 PROGRESS TRACKING - Unified Budget & Goals Hub */}
      <motion.div {...staggerAnimation.child}>
        <UnifiedProgressHub />
      </motion.div>

      {/* 🧠 INTELLIGENT INSIGHTS - AI-Powered Analysis */}
      <motion.div {...staggerAnimation.child}>
        <SmartInsightsPanel />
      </motion.div>
    </motion.div>
  )
}