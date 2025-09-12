'use client'

import { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'
import { useCachedData } from '@/hooks/use-cached-data'
import { useSessionState } from '@/hooks/use-persisted-state'
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

const formatCurrency = (value: number) => `${value.toLocaleString()}₪`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        className="bg-card/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-border/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className="font-semibold text-foreground mb-3 text-center">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <motion.div 
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: entry.color }}
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [`0 0 0 0 ${entry.color}40`, `0 0 0 4px ${entry.color}20`, `0 0 0 0 ${entry.color}40`]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm text-muted-foreground capitalize min-w-[60px]">{entry.dataKey}:</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }
  return null
}

const LoadingChart = () => (
  <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl bg-muted/30" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-muted/30" />
            <Skeleton className="h-4 w-64 bg-muted/30" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-muted/30 rounded-lg" />
          <Skeleton className="h-8 w-20 bg-muted/30 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-4 w-20 bg-muted/30 mx-auto" />
            <Skeleton className="h-6 w-24 bg-muted/40 mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-80 w-full">
        <Skeleton className="h-full w-full bg-muted/20 rounded-2xl" />
      </div>
    </div>
  </Card>
)

export function MonthlyTrends() {
  const { user } = useAuth()
  const [viewType, setViewType] = useSessionState('monthly-trends-view', 'area' as 'area' | 'bar')
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  // Memoized month calculation to prevent recalculation
  const months = useMemo(() => {
    const monthsArray = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthsArray.push({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      })
    }
    return monthsArray
  }, [])

  // Cached monthly data fetcher
  const fetchMonthlyData = useCallback(async (): Promise<MonthlyData[]> => {
    if (!user) throw new Error('User not authenticated')

    const monthlyData: MonthlyData[] = []

    // Fetch all months in parallel for better performance
    const promises = months.map(month =>
      supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', month.start.toISOString().split('T')[0])
        .lte('date', month.end.toISOString().split('T')[0])
        .then(result => ({
          ...month,
          data: result.data,
          error: result.error
        }))
    )

    const results = await Promise.all(promises)

    for (const result of results) {
      if (result.error) throw result.error

      const income = result.data
        ?.filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

      const expenses = result.data
        ?.filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) || 0

      monthlyData.push({
        month: result.label,
        income,
        expenses,
        net: income - expenses
      })
    }

    return monthlyData
  }, [user, months])

  // Use cached data with 10-minute cache for trends
  const { 
    data: rawData = [], 
    loading, 
    error 
  } = useCachedData(
    ['monthly-trends', user?.id, months[0]?.start.getTime().toString()],
    fetchMonthlyData,
    {
      ttl: 600000, // 10 minutes - trends change less frequently
      enabled: !!user && months.length > 0,
      staleWhileRevalidate: true
    }
  )

  // Memoized calculations to prevent recalculation on every render
  const { data, totalIncome, totalExpenses, netTotal } = useMemo(() => {
    const safeData = rawData || []
    const totalIncome = safeData.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = safeData.reduce((sum, month) => sum + month.expenses, 0)
    const netTotal = totalIncome - totalExpenses

    return {
      data: safeData,
      totalIncome,
      totalExpenses,
      netTotal
    }
  }, [rawData])

  if (loading) {
    return <LoadingChart />
  }

  if (error) {
    return (
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center py-12 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Error Loading Monthly Trends</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      </Card>
    )
  }


  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
        {/* Premium background effects */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        <div className="relative z-10 space-y-4">
          {/* Enhanced Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <BarChart3 className="h-5 w-5 text-primary" />
                
              </motion.div>
              
              <div>
                <h3 className="text-lg font-bold text-foreground">Monthly Trends</h3>
                <p className="text-xs text-muted-foreground/70">Financial Flow Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs bg-gradient-to-r from-info/10 to-primary/10 border-info/20">
                <Eye className="h-3 w-3 mr-1" />
                6 Months
              </Badge>
              
              <div className="flex items-center gap-1">
                <Button
                  variant={viewType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('area')}
                  className="text-xs px-2 py-1"
                >
                  Area
                </Button>
                <Button
                  variant={viewType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('bar')}
                  className="text-xs px-2 py-1"
                >
                  Bar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Compact Summary Stats */}
          <motion.div 
            className="flex items-center justify-between py-2 px-4 rounded-lg bg-gradient-to-r from-card/50 to-card/30 border border-border/30"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-muted-foreground">Income:</span>
              <span className="text-sm font-bold text-success">{formatCurrency(totalIncome)}</span>
            </div>
            
            <div className="w-px h-4 bg-border/50"></div>
            
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-muted-foreground">Expenses:</span>
              <span className="text-sm font-bold text-destructive">{formatCurrency(totalExpenses)}</span>
            </div>
            
            <div className="w-px h-4 bg-border/50"></div>
            
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${netTotal >= 0 ? 'text-success' : 'text-destructive'}`} />
              <span className="text-xs font-medium text-muted-foreground">Net:</span>
              <span className={`text-sm font-bold ${netTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(Math.abs(netTotal))}
              </span>
            </div>
          </motion.div>

          {/* Compact Chart */}
          <motion.div 
            className="h-72 w-full p-4 rounded-lg bg-gradient-to-br from-card/50 to-card/30 border border-border/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {data.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {viewType === 'area' ? (
                      <AreaChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          fill="url(#incomeGradient)"
                          strokeWidth={3}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ef4444" 
                          fill="url(#expenseGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Bar 
                          dataKey="income" 
                          fill="#10b981" 
                          name="Income" 
                          radius={[8, 8, 0, 0]}
                          opacity={0.9}
                        />
                        <Bar 
                          dataKey="expenses" 
                          fill="#ef4444" 
                          name="Expenses" 
                          radius={[8, 8, 0, 0]}
                          opacity={0.9}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div 
                className="flex items-center justify-center h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">No transaction data available</p>
                    <p className="text-sm text-muted-foreground/70">Start adding transactions to see trends</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}