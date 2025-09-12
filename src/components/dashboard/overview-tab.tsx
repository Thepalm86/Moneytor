'use client';

import * as React from 'react'
import { motion } from 'framer-motion'
import { Section } from '@/components/layout'
import { FinancialHealthScore } from '@/components/dashboard/financial-health-score'
import { EnhancedOverviewCards } from '@/components/dashboard/enhanced-overview-cards'
import { SmartQuickActions } from '@/components/dashboard/smart-quick-actions'
import { MonthlyTrends } from '@/components/dashboard/monthly-trends'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UnifiedProgressHub } from '@/components/dashboard/unified-progress-hub'
import { SmartInsightsPanel } from '@/components/dashboard/smart-insights-panel'

export function OverviewTab() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    }
  }

  return (
    <motion.div 
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 📊 PRIMARY METRICS - Enhanced Overview Cards (3-card layout) */}
      <motion.div variants={sectionVariants}>
        <Section 
          title="Financial Overview"
          description="Your key financial metrics and performance indicators"
          className="space-y-8"
        >
          <EnhancedOverviewCards />
        </Section>
      </motion.div>

      {/* ⚡ CONTEXTUAL QUICK ACTIONS - Smart Recommendations */}
      <motion.div variants={sectionVariants}>
        <SmartQuickActions />
      </motion.div>

      {/* 📈 INSIGHTS SECTION - Monthly Trends & Recent Activity */}
      <motion.div 
        variants={sectionVariants}
        className="grid grid-cols-1 xl:grid-cols-2 gap-10"
      >
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <MonthlyTrends />
        </motion.div>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <RecentTransactions />
        </motion.div>
      </motion.div>

      {/* 🎯 PROGRESS TRACKING - Unified Budget & Goals Hub */}
      <motion.div variants={sectionVariants}>
        <UnifiedProgressHub />
      </motion.div>

      {/* 🧠 INTELLIGENT INSIGHTS - AI-Powered Analysis */}
      <motion.div variants={sectionVariants}>
        <SmartInsightsPanel />
      </motion.div>

      {/* 🏆 HERO SECTION - Financial Health Score */}
      <motion.div variants={sectionVariants}>
        <FinancialHealthScore />
      </motion.div>
    </motion.div>
  )
}