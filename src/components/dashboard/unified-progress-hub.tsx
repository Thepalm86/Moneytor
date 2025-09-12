'use client'

import { useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Target, 
  PiggyBank, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  Award,
  Flame,
  Zap,
  Eye,
  ChevronRight
} from 'lucide-react'
import { dashboardOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'
import { useCachedData } from '@/hooks/use-cached-data'

interface ProgressItem {
  id: string
  type: 'budget' | 'goal'
  title: string
  subtitle: string
  current: number
  target: number
  percentage: number
  status: 'success' | 'warning' | 'danger'
  color: string
  daysLeft: number | null
}

interface Alert {
  type: string
  severity: 'high' | 'medium'
  title: string
  message: string
  action: string
  href: string
}

interface UnifiedProgressData {
  alerts: Alert[]
  progressItems: ProgressItem[]
  summary: {
    totalBudgets: number
    budgetsOnTrack: number
    totalGoals: number
    achievedGoals: number
  }
}

const formatCurrency = (amount: number) => `${amount.toLocaleString()}₪`

const statusConfig = {
  'success': {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: CheckCircle,
    badge: 'success' as const
  },
  'warning': {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: AlertTriangle,
    badge: 'warning' as const
  },
  'danger': {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: AlertCircle,
    badge: 'destructive' as const
  }
}

const AlertCard = ({ alert, index }: { alert: Alert; index: number }) => {
  const isHigh = alert.severity === 'high'
  const Icon = isHigh ? AlertCircle : AlertTriangle
  const colorClass = isHigh ? 'text-destructive' : 'text-warning'
  const bgClass = isHigh ? 'bg-destructive/10 border-destructive/20' : 'bg-warning/10 border-warning/20'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
    >
      <Link href={alert.href}>
        <Card 
          variant="glass" 
          className={`p-4 hover:shadow-lg transition-all duration-200 ${bgClass} border backdrop-blur-sm cursor-pointer group`}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className={`p-2 rounded-xl ${bgClass} ${colorClass} flex-shrink-0`}
              animate={isHigh ? {
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                <Badge variant={isHigh ? 'destructive' : 'warning'} className="text-xs px-2 py-1">
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground/80">{alert.message}</p>
              <p className={`text-xs font-medium ${colorClass} group-hover:underline`}>
                {alert.action} →
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

const CompactProgressItem = ({ item, index }: { item: ProgressItem; index: number }) => {
  const config = statusConfig[item.status]
  const Icon = item.type === 'budget' ? Target : PiggyBank
  const StatusIcon = config.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex-shrink-0 min-w-[200px] md:min-w-0"
    >
      <div className="p-3 rounded-lg border border-border/30 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <Icon className="h-3 w-3" style={{ color: item.color }} />
            </div>
            <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
          </div>
          <Badge variant={config.badge} className="text-xs px-2 py-0.5">
            {Math.round(item.percentage)}%
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="relative">
            <div className="h-1.5 w-full rounded-full bg-muted/20"></div>
            <motion.div
              className="absolute inset-y-0 left-0 h-1.5 rounded-full"
              style={{ background: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(item.percentage, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(item.current)}</span>
            <span>{formatCurrency(item.target)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ProgressItemCard = ({ item, index }: { item: ProgressItem; index: number }) => {
  const config = statusConfig[item.status]
  const Icon = item.type === 'budget' ? Target : PiggyBank
  const StatusIcon = config.icon
  
  const getDaysLeftText = () => {
    if (!item.daysLeft) return ''
    if (item.daysLeft < 0) return 'Overdue'
    if (item.daysLeft === 0) return 'Due today'
    if (item.daysLeft === 1) return '1 day left'
    if (item.daysLeft <= 30) return `${item.daysLeft} days left`
    return `${Math.round(item.daysLeft / 30)} month${Math.round(item.daysLeft / 30) > 1 ? 's' : ''} left`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
    >
      <Card 
        variant="glass" 
        className="p-4 hover:shadow-lg transition-all duration-200 group backdrop-blur-sm border border-border/30"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                style={{ backgroundColor: `${item.color}20`, borderColor: `${item.color}40` }}
              >
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground leading-tight">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground/70">{item.subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={config.badge} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {Math.round(item.percentage)}%
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">
                {formatCurrency(item.current)} / {formatCurrency(item.target)}
              </span>
              {item.daysLeft !== null && (
                <div className="flex items-center gap-1 text-muted-foreground/70">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs font-medium">{getDaysLeftText()}</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Progress 
                value={Math.min(item.percentage, 100)} 
                className="h-2"
                style={{ 
                  background: `${item.color}15`,
                }}
              />
              <motion.div
                className="absolute inset-0 h-2 rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                  width: `${Math.min(item.percentage, 100)}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const LoadingHub = () => (
  <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl bg-muted/30" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-muted/30" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
      </div>
      
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-4 w-16 bg-muted/30 mx-auto" />
            <Skeleton className="h-6 w-12 bg-muted/40 mx-auto" />
          </div>
        ))}
      </div>

      {/* Progress items skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-muted/10">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-muted/30" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-muted/30" />
                <Skeleton className="h-3 w-24 bg-muted/30" />
              </div>
            </div>
            <Skeleton className="h-2 w-full bg-muted/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </Card>
)

// Memoized components to prevent unnecessary re-renders
const MemoizedAlertCard = memo(AlertCard)
const MemoizedProgressItemCard = memo(ProgressItemCard)

export function UnifiedProgressHub() {
  const { user } = useAuth()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Cached progress data fetcher
  const fetchProgressData = useCallback(async (): Promise<UnifiedProgressData> => {
    if (!user) throw new Error('User not authenticated')
    return await dashboardOperations.getUnifiedProgressData(user.id)
  }, [user])

  // Use cached data with 3-minute cache for progress data
  const { 
    data: progressData, 
    loading, 
    error 
  } = useCachedData(
    ['unified-progress', user?.id],
    fetchProgressData,
    {
      ttl: 180000, // 3 minutes - progress updates more frequently
      enabled: !!user,
      staleWhileRevalidate: true
    }
  )

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.1
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

  if (loading) {
    return <LoadingHub />
  }

  if (error || !progressData) {
    return (
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Unable to Load Progress Data</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  const { alerts, progressItems, summary } = progressData

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <Card variant="premium" className="p-4 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-xl">
        <div className="space-y-3">
          {/* Compact Header with inline metrics */}
          <motion.div variants={childVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm border border-secondary/20 flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Target className="h-5 w-5 text-secondary" />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-foreground">Progress Hub</h3>
                  <p className="text-xs text-muted-foreground/70">Budgets & Goals Tracking</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Inline Summary Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-display">{summary.totalBudgets}</span>
                    <span className="text-muted-foreground">budgets</span>
                  </div>
                  <div className="w-px h-4 bg-border/50"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-display">{summary.totalGoals}</span>
                    <span className="text-muted-foreground">goals</span>
                  </div>
                  {alerts.length > 0 && (
                    <>
                      <div className="w-px h-4 bg-border/50"></div>
                      <Badge variant="destructive" className="text-xs">
                        {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
                      </Badge>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <Link href="/dashboard/targets">
                    View All
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Priority Alerts - Compact inline */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2"
                variants={childVariants}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {alerts.slice(0, 3).map((alert, index) => (
                  <Link key={index} href={alert.href}>
                    <Badge variant="destructive" className="text-xs cursor-pointer hover:bg-destructive/90">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {alert.title}
                    </Badge>
                  </Link>
                ))}
                {alerts.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{alerts.length - 3} more
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Items - Horizontal scroll on mobile, grid on desktop */}
          {progressItems.length > 0 ? (
            <motion.div className="space-y-2" variants={childVariants}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Recent Progress</h4>
                {progressItems.length > 4 && (
                  <Link href="/dashboard/targets">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                      View all {progressItems.length}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Compact progress items */}
              <div className="flex md:grid md:grid-cols-2 gap-2 overflow-x-auto pb-2 md:pb-0 md:overflow-visible">
                <AnimatePresence>
                  {progressItems.slice(0, 4).map((item, index) => (
                    <CompactProgressItem key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-6 space-y-2"
              variants={childVariants}
            >
              <div className="h-12 w-12 mx-auto rounded-lg bg-muted/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">No active budgets or goals</p>
                <div className="flex items-center justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/targets">
                      <Target className="h-3 w-3 mr-1" />
                      Budget
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/goals">
                      <PiggyBank className="h-3 w-3 mr-1" />
                      Goal
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}