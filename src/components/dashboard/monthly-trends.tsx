'use client'

import { useState, useEffect } from 'react'
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
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Eye,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

const formatCurrency = (value: number) => `₪${value.toLocaleString()}`

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
  <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
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
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'area' | 'bar'>('area')
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (!user) return

    const fetchMonthlyData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get data for last 6 months
        const months = []
        const now = new Date()
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          months.push({
            start: new Date(date.getFullYear(), date.getMonth(), 1),
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          })
        }

        const monthlyData: MonthlyData[] = []

        for (const month of months) {
          const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user.id)
            .gte('date', month.start.toISOString().split('T')[0])
            .lte('date', month.end.toISOString().split('T')[0])

          if (error) throw error

          const income = transactions
            ?.filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

          const expenses = transactions
            ?.filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) || 0

          monthlyData.push({
            month: month.label,
            income,
            expenses,
            net: income - expenses
          })
        }

        setData(monthlyData)
      } catch (err) {
        console.error('Error fetching monthly data:', err)
        setError('Failed to load monthly trends')
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [user])

  if (loading) {
    return <LoadingChart />
  }

  if (error) {
    return (
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
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

  const totalIncome = data.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = data.reduce((sum, month) => sum + month.expenses, 0)
  const netTotal = totalIncome - totalExpenses

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
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
        
        <div className="relative z-10 space-y-8">
          {/* Enhanced Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 5,
                  boxShadow: "0 15px 30px -5px rgba(139, 92, 246, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <BarChart3 className="h-7 w-7 text-primary" />
                
                {/* Background pulse animation */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0"
                  animate={{
                    opacity: [0, 0.3, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              </motion.div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                  Monthly Trends
                </h3>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary/70" />
                  <span className="text-sm font-medium text-muted-foreground/70 tracking-wider uppercase">
                    Financial Flow Analysis
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-info/10 to-primary/10 border-info/20">
                <Eye className="h-3 w-3" />
                6 Months
              </Badge>
              
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={viewType === 'area' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewType('area')}
                    className="text-sm font-semibold backdrop-blur-sm shadow-md"
                  >
                    Area
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={viewType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewType('bar')}
                    className="text-sm font-semibold backdrop-blur-sm shadow-md"
                  >
                    Bar
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Summary Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div 
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-success" />
                <p className="text-sm font-semibold text-success">Total Income</p>
              </div>
              <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Total Expenses</p>
              </div>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </motion.div>
            
            <motion.div 
              className={`text-center p-4 rounded-2xl backdrop-blur-sm border ${
                netTotal >= 0 
                  ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20' 
                  : 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className={`h-4 w-4 ${netTotal >= 0 ? 'text-success' : 'text-destructive'}`} />
                <p className={`text-sm font-semibold ${netTotal >= 0 ? 'text-success' : 'text-destructive'}`}>Net Total</p>
              </div>
              <p className={`text-xl font-bold ${netTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netTotal)}
              </p>
            </motion.div>
          </motion.div>

          {/* Enhanced Chart */}
          <motion.div 
            className="h-96 w-full p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border/30 backdrop-blur-sm"
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