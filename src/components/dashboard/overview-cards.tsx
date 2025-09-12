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
  const colorClass = trend.isPositive ? 'text-success' : 'text-destructive'
  const bgClass = trend.isPositive ? 'bg-success/10' : 'bg-destructive/10'
  const sign = trend.isPositive ? '+' : ''

  return (
    <div className="mt-4 flex items-center gap-3 animate-in">
      <div className={`p-1.5 rounded-lg glass-card ${bgClass}`}>
        <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${colorClass}`}>
          {sign}{Math.abs(trend.percentage).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground/70 font-medium">{label}</span>
      </div>
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
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary"
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
    <Card 
      variant="premium" 
      className={`p-6 hover-lift hover-glow group relative overflow-hidden h-full flex flex-col ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground/80 tracking-wide uppercase mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-display text-foreground leading-tight">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${iconBgColor} flex items-center justify-center glass-card group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        <div className="flex flex-col justify-end flex-1 space-y-3">
          {badge && (
            <Badge 
              variant={badge.variant || 'secondary'} 
              className="text-xs font-medium px-3 py-1 rounded-full w-fit"
            >
              {badge.text}
            </Badge>
          )}

          {trend && <TrendIndicator trend={trend} label="from last month" />}
        </div>
      </div>
    </Card>
  )
}

const LoadingCard = () => (
  <Card variant="premium" className="p-6 animate-pulse h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-3 w-20 bg-muted/30 mb-2" />
        <Skeleton className="h-8 w-28 bg-muted/40" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl bg-muted/30 flex-shrink-0" />
    </div>
    <div className="flex flex-col justify-end flex-1">
      <Skeleton className="h-4 w-32 bg-muted/30" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <LoadingCard />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card variant="premium" className="p-8 col-span-full text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-medium">Error loading financial data</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="animate-in" style={{ animationDelay: '100ms' }}>
        <MetricCard
          title="Current Balance"
          value={metrics.totalBalance}
          icon={DollarSign}
          trend={trends.balance}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
      </div>

      <div className="animate-in" style={{ animationDelay: '200ms' }}>
        <MetricCard
          title="Monthly Income"
          value={metrics.monthlyIncome}
          icon={ArrowUpRight}
          trend={trends.income}
          iconBgColor="bg-success/10"
          iconColor="text-success"
        />
      </div>

      <div className="animate-in" style={{ animationDelay: '300ms' }}>
        <MetricCard
          title="Monthly Expenses"
          value={metrics.monthlyExpenses}
          icon={ArrowDownRight}
          trend={trends.expense}
          iconBgColor="bg-destructive/10"
          iconColor="text-destructive"
        />
      </div>

      <div className="animate-in" style={{ animationDelay: '400ms' }}>
        <MetricCard
          title="Savings Goals"
          value={metrics.savingsGoals.total}
          icon={PiggyBank}
          badge={{
            text: `${metrics.savingsGoals.active} active`,
            variant: metrics.savingsGoals.active > 0 ? 'success' : 'secondary'
          }}
          iconBgColor="bg-secondary/10"
          iconColor="text-secondary"
        />
      </div>
    </div>
  )
}