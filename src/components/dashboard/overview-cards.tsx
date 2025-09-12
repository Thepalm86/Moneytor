'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { transactionOperations } from '@/lib/supabase-helpers'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'

interface FinancialMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoals: {
    total: number
    active: number
    completed: number
  }
  budgetProgress: {
    totalBudget: number
    totalSpent: number
    percentage: number
  }
}

interface TrendData {
  value: number
  percentage: number
  isPositive: boolean
}

const formatCurrency = (amount: number) => {
  return `₪${amount.toLocaleString()}`
}

const TrendIndicator = ({ trend, label }: { trend: TrendData; label: string }) => {
  const Icon = trend.isPositive ? TrendingUp : TrendingDown
  const colorClass = trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
  const sign = trend.isPositive ? '+' : ''

  return (
    <div className="mt-4 flex items-center gap-2">
      <div className={`p-1 rounded-full ${trend.isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
        <Icon className={`h-3 w-3 ${colorClass}`} />
      </div>
      <span className={`text-sm font-medium ${colorClass}`}>
        {sign}{Math.abs(trend.percentage).toFixed(1)}%
      </span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  )
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  badge,
  className = "",
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: TrendData
  badge?: { text: string; variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
  className?: string
  iconBgColor?: string
  iconColor?: string
}) => {
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 border-0 bg-white/60 backdrop-blur-sm ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>

        {badge && (
          <Badge variant={badge.variant || 'secondary'} className="text-xs">
            {badge.text}
          </Badge>
        )}

        {trend && <TrendIndicator trend={trend} label="from last month" />}
      </div>
    </Card>
  )
}

const LoadingCard = () => (
  <Card className="p-6 bg-white/60 backdrop-blur-sm">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <Skeleton className="h-5 w-40" />
    </div>
  </Card>
)

export function OverviewCards() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Calculate current month's data
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // Fetch transactions for current and last month
        const { data: currentTransactions, error: currentError } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startOfMonth.toISOString().split('T')[0])

        const { data: lastMonthTransactions, error: lastError } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startOfLastMonth.toISOString().split('T')[0])
          .lte('date', endOfLastMonth.toISOString().split('T')[0])

        if (currentError) throw currentError
        if (lastError) throw lastError

        // Calculate current month metrics
        const currentIncome = currentTransactions
          ?.filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

        const currentExpenses = currentTransactions
          ?.filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) || 0

        // Calculate last month metrics for comparison
        const lastMonthIncome = lastMonthTransactions
          ?.filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

        const lastMonthExpenses = lastMonthTransactions
          ?.filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) || 0

        // Fetch savings goals
        const { data: goals, error: goalsError } = await supabase
          .from('saving_goals')
          .select('*')
          .eq('user_id', user.id)

        if (goalsError) throw goalsError

        const activeGoals = goals?.filter((g: any) => !g.is_achieved) || []
        const completedGoals = goals?.filter((g: any) => g.is_achieved) || []

        // Fetch budget targets
        const { data: targets, error: targetsError } = await supabase
          .from('targets')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (targetsError) throw targetsError

        const totalBudget = targets?.reduce((sum: number, t: any) => sum + Number(t.target_amount), 0) || 0
        
        // Calculate budget spending (simplified - should match actual spending to categories)
        const totalSpent = currentExpenses

        // Calculate trends
        const incomeTrend = lastMonthIncome > 0 
          ? { 
              value: currentIncome, 
              percentage: ((currentIncome - lastMonthIncome) / lastMonthIncome) * 100,
              isPositive: currentIncome >= lastMonthIncome
            }
          : { value: currentIncome, percentage: 0, isPositive: true }

        const expenseTrend = lastMonthExpenses > 0 
          ? { 
              value: currentExpenses, 
              percentage: ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100,
              isPositive: currentExpenses <= lastMonthExpenses
            }
          : { value: currentExpenses, percentage: 0, isPositive: false }

        const totalBalance = currentIncome - currentExpenses
        const lastMonthBalance = lastMonthIncome - lastMonthExpenses
        const balanceTrend = lastMonthBalance !== 0 
          ? { 
              value: totalBalance, 
              percentage: ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100,
              isPositive: totalBalance >= lastMonthBalance
            }
          : { value: totalBalance, percentage: 0, isPositive: totalBalance >= 0 }

        setMetrics({
          totalBalance,
          monthlyIncome: currentIncome,
          monthlyExpenses: currentExpenses,
          savingsGoals: {
            total: goals?.length || 0,
            active: activeGoals.length,
            completed: completedGoals.length
          },
          budgetProgress: {
            totalBudget,
            totalSpent,
            percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
          }
        })

        // Store trends for use in cards
        setTrends({
          balance: balanceTrend,
          income: incomeTrend,
          expense: expenseTrend
        })

      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError('Failed to load financial metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  const [trends, setTrends] = useState<{
    balance: TrendData
    income: TrendData
    expense: TrendData
  }>({
    balance: { value: 0, percentage: 0, isPositive: true },
    income: { value: 0, percentage: 0, isPositive: true },
    expense: { value: 0, percentage: 0, isPositive: false }
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 col-span-full text-center">
          <p className="text-rose-600 mb-2">Error loading financial data</p>
          <p className="text-sm text-slate-500">{error}</p>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Current Balance"
        value={metrics.totalBalance}
        icon={DollarSign}
        trend={trends.balance}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />

      <MetricCard
        title="Monthly Income"
        value={metrics.monthlyIncome}
        icon={ArrowUpRight}
        trend={trends.income}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
      />

      <MetricCard
        title="Monthly Expenses"
        value={metrics.monthlyExpenses}
        icon={ArrowDownRight}
        trend={trends.expense}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
      />

      <MetricCard
        title="Savings Goals"
        value={metrics.savingsGoals.total}
        icon={PiggyBank}
        badge={{
          text: `${metrics.savingsGoals.active} active`,
          variant: metrics.savingsGoals.active > 0 ? 'success' : 'secondary'
        }}
        iconBgColor="bg-violet-50"
        iconColor="text-violet-600"
      />
    </div>
  )
}