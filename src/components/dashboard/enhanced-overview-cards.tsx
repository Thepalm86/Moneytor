'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'

interface FinancialMetrics {
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  budgetUtilization: {
    percentage: number
    onTrack: boolean
    budgetCount: number
  }
  trends: {
    income: TrendData
    expenses: TrendData
    netWorth: TrendData
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

const TrendIndicator = ({ trend, label, compact = false }: { 
  trend: TrendData
  label: string
  compact?: boolean 
}) => {
  const Icon = trend.isPositive ? TrendingUp : TrendingDown
  const colorClass = trend.isPositive ? 'text-success' : 'text-destructive'
  const bgClass = trend.isPositive ? 'bg-success/10' : 'bg-destructive/10'
  const borderClass = trend.isPositive ? 'border-success/20' : 'border-destructive/20'
  const sign = trend.isPositive ? '+' : ''

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div 
          className={`p-1.5 rounded-lg glass-card border ${bgClass} ${borderClass} backdrop-blur-sm`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon className={`h-3 w-3 ${colorClass}`} />
        </motion.div>
        
        <div className="flex flex-col">
          <motion.span 
            className={`text-xs font-bold ${colorClass}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {sign}{Math.abs(trend.percentage).toFixed(1)}%
          </motion.span>
          <span className="text-xs text-muted-foreground/60 font-medium">{label}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="mt-4 flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <motion.div 
        className={`relative p-2 rounded-xl glass-card border ${bgClass} ${borderClass} backdrop-blur-sm`}
        whileHover={{ scale: 1.1, rotate: trend.isPositive ? 5 : -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
      </motion.div>
      
      <div className="flex items-center gap-2">
        <motion.span 
          className={`text-sm font-bold ${colorClass}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {sign}{Math.abs(trend.percentage).toFixed(1)}%
        </motion.span>
        <span className="text-xs text-muted-foreground/70 font-medium">{label}</span>
      </div>
    </motion.div>
  )
}

interface EnhancedMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: TrendData
  badge?: { text: string; variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
  className?: string
  iconBgColor?: string
  iconColor?: string
  additionalInfo?: React.ReactNode
}

const EnhancedMetricCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend, 
  badge,
  className = "",
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  additionalInfo
}: EnhancedMetricCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
        staggerChildren: 0.1
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <motion.div
        className="group relative overflow-hidden h-full"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card 
          variant="premium" 
          className={`relative p-8 h-full flex flex-col backdrop-blur-xl bg-gradient-to-br from-card/90 via-card/95 to-card/90 border-2 border-border/50 shadow-xl hover:shadow-2xl ${className}`}
        >
          {/* Premium animated background effects */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          
          {/* Animated border glow effect */}
          <motion.div 
            className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-hover:opacity-100"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 25px 0 rgba(139, 92, 246, 0.15)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Content */}
          <div className="relative flex flex-col h-full z-10">
            <motion.div 
              className="flex items-start justify-between mb-6"
              variants={childVariants}
            >
              <div className="flex-1 space-y-4">
                <motion.p 
                  className="text-xs font-bold text-muted-foreground/90 tracking-[0.1em] uppercase"
                  variants={childVariants}
                >
                  {title}
                </motion.p>
                <motion.div
                  variants={childVariants}
                  className="space-y-2"
                >
                  <p className="text-3xl lg:text-4xl font-bold text-display bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent leading-none">
                    {typeof value === 'number' ? formatCurrency(value) : value}
                  </p>
                  {subtitle && (
                    <p className="text-sm font-medium text-muted-foreground/80">
                      {subtitle}
                    </p>
                  )}
                  {/* Subtle value accent */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary/60 to-transparent rounded-full" />
                </motion.div>
              </div>

              {/* Enhanced icon container */}
              <motion.div 
                className={`relative h-16 w-16 rounded-2xl ${iconBgColor} backdrop-blur-sm border border-border/30 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl`}
                variants={childVariants}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 10,
                  boxShadow: "0 15px 35px -5px rgba(139, 92, 246, 0.4)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon className={`h-7 w-7 ${iconColor}`} />
                
                {/* Icon background glow */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl ${iconBgColor} opacity-0 group-hover:opacity-70`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Enhanced bottom section */}
            <motion.div 
              className="flex flex-col justify-end flex-1 space-y-5"
              variants={childVariants}
            >
              {additionalInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {additionalInfo}
                </motion.div>
              )}

              {badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge 
                    variant={badge.variant || 'secondary'} 
                    className="text-xs font-semibold px-4 py-2 rounded-full w-fit bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    {badge.text}
                  </Badge>
                </motion.div>
              )}

              {trend && <TrendIndicator trend={trend} label="vs last month" />}
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const LoadingCard = () => (
  <Card variant="premium" className="p-8 animate-pulse h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-3 w-24 bg-muted/30" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-36 bg-muted/40" />
          <Skeleton className="h-4 w-28 bg-muted/30" />
          <div className="w-12 h-0.5 bg-muted/40 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-16 w-16 rounded-2xl bg-muted/30 flex-shrink-0" />
    </div>
    <div className="flex flex-col justify-end flex-1 space-y-4">
      <Skeleton className="h-6 w-32 bg-muted/30" />
      <Skeleton className="h-8 w-40 bg-muted/30" />
    </div>
  </Card>
)

export function EnhancedOverviewCards() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchEnhancedMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Calculate current and last month periods
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // Fetch current month transactions
        const { data: currentTransactions, error: currentError } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startOfMonth.toISOString().split('T')[0])

        // Fetch last month transactions
        const { data: lastMonthTransactions, error: lastError } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startOfLastMonth.toISOString().split('T')[0])
          .lte('date', endOfLastMonth.toISOString().split('T')[0])

        // Fetch active budget targets
        const { data: targets, error: targetsError } = await supabase
          .from('targets')
          .select('target_amount')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (currentError || lastError || targetsError) {
          throw currentError || lastError || targetsError
        }

        // Calculate current month metrics
        const currentIncome = currentTransactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0

        const currentExpenses = currentTransactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0

        // Calculate last month metrics
        const lastMonthIncome = lastMonthTransactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0

        const lastMonthExpenses = lastMonthTransactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0

        // Calculate net worth and trends
        const currentNetWorth = currentIncome - currentExpenses
        const lastMonthNetWorth = lastMonthIncome - lastMonthExpenses

        // Budget utilization
        const totalBudget = targets?.reduce((sum, t) => sum + Number(t.target_amount), 0) || 0
        const budgetUtilization = {
          percentage: totalBudget > 0 ? (currentExpenses / totalBudget) * 100 : 0,
          onTrack: totalBudget > 0 ? currentExpenses / totalBudget < 0.85 : true,
          budgetCount: targets?.length || 0
        }

        // Calculate trends
        const incomeTrend: TrendData = lastMonthIncome > 0 
          ? { 
              value: currentIncome, 
              percentage: ((currentIncome - lastMonthIncome) / lastMonthIncome) * 100,
              isPositive: currentIncome >= lastMonthIncome
            }
          : { value: currentIncome, percentage: 0, isPositive: true }

        const expensesTrend: TrendData = lastMonthExpenses > 0 
          ? { 
              value: currentExpenses, 
              percentage: ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100,
              isPositive: currentExpenses <= lastMonthExpenses // Lower expenses are positive
            }
          : { value: currentExpenses, percentage: 0, isPositive: false }

        const netWorthTrend: TrendData = {
          value: currentNetWorth,
          percentage: lastMonthNetWorth !== 0 
            ? ((currentNetWorth - lastMonthNetWorth) / Math.abs(lastMonthNetWorth)) * 100
            : 0,
          isPositive: currentNetWorth >= lastMonthNetWorth
        }

        setMetrics({
          netWorth: currentNetWorth,
          monthlyIncome: currentIncome,
          monthlyExpenses: currentExpenses,
          budgetUtilization,
          trends: {
            income: incomeTrend,
            expenses: expensesTrend,
            netWorth: netWorthTrend
          }
        })

      } catch (err) {
        console.error('Error fetching enhanced metrics:', err)
        setError('Failed to load financial metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchEnhancedMetrics()
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in">
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <LoadingCard />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card variant="premium" className="p-8 col-span-full text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Error loading financial data</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const getBudgetUtilizationInfo = () => {
    const { percentage, onTrack, budgetCount } = metrics.budgetUtilization
    
    if (budgetCount === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
          <Target className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-warning">No budgets set</span>
        </div>
      )
    }

    const Icon = onTrack ? CheckCircle : AlertTriangle
    const colorClass = onTrack ? 'text-success' : percentage > 100 ? 'text-destructive' : 'text-warning'
    const bgClass = onTrack ? 'bg-success/10 border-success/20' : percentage > 100 ? 'bg-destructive/10 border-destructive/20' : 'bg-warning/10 border-warning/20'
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgClass} border`}>
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className={`text-sm font-medium ${colorClass}`}>
          {Math.round(percentage)}% utilized
        </span>
      </div>
    )
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Net Worth - Most Important */}
      <EnhancedMetricCard
        title="Net Worth"
        value={metrics.netWorth}
        subtitle="Current month balance"
        icon={Wallet}
        trend={metrics.trends.netWorth}
        iconBgColor="bg-gradient-to-br from-primary/20 to-primary/10"
        iconColor="text-primary"
        className="bg-gradient-to-br from-primary/3 via-transparent to-primary/3 md:col-span-1"
        badge={{
          text: metrics.netWorth >= 0 ? 'Positive' : 'Needs attention',
          variant: metrics.netWorth >= 0 ? 'success' : 'destructive'
        }}
      />

      {/* Monthly Income */}
      <EnhancedMetricCard
        title="Monthly Income"
        value={metrics.monthlyIncome}
        subtitle="Current month earnings"
        icon={TrendingUp}
        trend={metrics.trends.income}
        iconBgColor="bg-gradient-to-br from-success/20 to-success/10"
        iconColor="text-success"
        className="bg-gradient-to-br from-success/3 via-transparent to-success/3"
        additionalInfo={
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Calendar className="h-3 w-3" />
            <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
        }
      />

      {/* Monthly Expenses */}
      <EnhancedMetricCard
        title="Monthly Expenses" 
        value={metrics.monthlyExpenses}
        subtitle="Current month spending"
        icon={Activity}
        trend={metrics.trends.expenses}
        iconBgColor="bg-gradient-to-br from-destructive/20 to-destructive/10"
        iconColor="text-destructive"
        className="bg-gradient-to-br from-destructive/3 via-transparent to-destructive/3"
        additionalInfo={getBudgetUtilizationInfo()}
      />
    </motion.div>
  )
}