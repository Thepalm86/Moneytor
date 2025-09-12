'use client'

import { useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Zap,
  Eye,
  BarChart3
} from 'lucide-react'
import { dashboardOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'
import { useCachedData } from '@/hooks/use-cached-data'

interface Insight {
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  action: string
  icon: string
}

const iconMap = {
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
  'PieChart': PieChart,
  'BarChart3': BarChart3,
  'CheckCircle': CheckCircle,
  'AlertTriangle': AlertTriangle,
  'Info': Info
}

const insightConfig = {
  'success': {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    badge: 'success' as const,
    icon: CheckCircle
  },
  'warning': {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    badge: 'warning' as const,
    icon: AlertTriangle
  },
  'info': {
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
    badge: 'default' as const,
    icon: Info
  }
}

interface InsightCardProps extends Insight {
  index: number
}

const CompactInsightCard = ({ type, title, message, action, icon, index }: InsightCardProps) => {
  const config = insightConfig[type]
  const Icon = iconMap[icon as keyof typeof iconMap] || Info

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex-shrink-0 min-w-[280px]"
    >
      <div className={`p-3 rounded-lg border ${config.border} ${config.bg} backdrop-blur-sm hover:shadow-sm transition-all duration-200`}>
        <div className="flex items-start gap-3">
          <div 
            className={`h-8 w-8 rounded-md ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground leading-tight">{title}</h4>
              <Badge variant={config.badge} className="text-xs px-1.5 py-0.5">
                {type.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
              {message}
            </p>
            
            <button className={`text-xs font-semibold ${config.color} hover:underline`}>
              {action} →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const InsightCard = ({ type, title, message, action, icon, index }: InsightCardProps) => {
  const config = insightConfig[type]
  const Icon = iconMap[icon as keyof typeof iconMap] || Info
  const ConfigIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      <Card 
        variant="glass" 
        className={`p-4 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm border ${config.border} ${config.bg}`}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <motion.div 
              className={`relative h-10 w-10 rounded-xl ${config.bg} backdrop-blur-sm border ${config.border} flex items-center justify-center shadow-sm flex-shrink-0 group-hover:shadow-md`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className={`h-5 w-5 ${config.color}`} />
              
              {/* Background pulse for warnings */}
              {type === 'warning' && (
                <motion.div 
                  className={`absolute inset-0 rounded-xl ${config.bg} opacity-0`}
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
              )}
            </motion.div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-foreground leading-tight">{title}</h4>
                <Badge variant={config.badge} className="text-xs px-2 py-1">
                  <ConfigIcon className="h-3 w-3 mr-1" />
                  {type.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action */}
          <motion.div 
            className="flex items-center justify-between pt-2 border-t border-border/30"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className={`text-sm font-semibold ${config.color} group-hover:underline cursor-pointer`}>
              {action}
            </span>
            
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <ArrowRight className={`h-4 w-4 ${config.color}`} />
            </motion.div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

const LoadingInsights = () => (
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
      
      {/* Insights skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-muted/10">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl bg-muted/30" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32 bg-muted/30" />
                  <Skeleton className="h-5 w-16 bg-muted/30 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full bg-muted/30" />
                <Skeleton className="h-3 w-3/4 bg-muted/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
)

// Memoized InsightCard to prevent unnecessary re-renders  
const MemoizedInsightCard = memo(InsightCard)

export function SmartInsightsPanel() {
  const { user } = useAuth()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Static fallback insights
  const fallbackInsights = useMemo(() => [
    {
      type: 'info' as const,
      title: 'Welcome to Moneytor',
      message: 'Start by adding your first transaction to begin tracking your finances',
      action: 'Add Transaction',
      icon: 'Info'
    }
  ], [])

  // Cached insights fetcher with fallback
  const fetchInsights = useCallback(async (): Promise<Insight[]> => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      return await dashboardOperations.getFinancialInsights(user.id)
    } catch (err) {
      console.error('Error fetching insights, using fallback:', err)
      return fallbackInsights
    }
  }, [user, fallbackInsights])

  // Use cached data with 15-minute cache for insights
  const { 
    data: insights = [], 
    loading, 
    error 
  } = useCachedData(
    ['smart-insights', user?.id],
    fetchInsights,
    {
      ttl: 900000, // 15 minutes - insights change less frequently
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
    return <LoadingInsights />
  }

  if (error && insights.length === 0) {
    return (
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Unable to Load Insights</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <Card variant="premium" className="p-4 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-xl">
        <div className="space-y-3">
          {/* Compact Header */}
          <motion.div variants={childVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-info/20 to-info/10 backdrop-blur-sm border border-info/20 flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Brain className="h-5 w-5 text-info" />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-foreground">Smart Insights</h3>
                  <p className="text-xs text-muted-foreground/70">AI-Powered Analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-xs bg-gradient-to-r from-info/10 to-primary/10 border-info/20">
                  <Zap className="h-3 w-3 mr-1" />
                  {insights.length} Insight{insights.length > 1 ? 's' : ''}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <Link href="/dashboard/reports">
                    Reports
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Compact Insights - Horizontal layout */}
          {insights.length > 0 ? (
            <motion.div variants={childVariants}>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <AnimatePresence>
                  {insights.slice(0, 3).map((insight, index) => (
                    <CompactInsightCard
                      key={index}
                      {...insight}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
              {insights.length > 3 && (
                <div className="text-center mt-2">
                  <Link href="/dashboard/reports">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                      View {insights.length - 3} more insights
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-6 space-y-2"
              variants={childVariants}
            >
              <div className="h-12 w-12 mx-auto rounded-lg bg-gradient-to-br from-info/10 to-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-info" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Building your insights...</p>
                <div className="flex items-center justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/transactions?action=add">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Transaction
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/targets?action=add">
                      <Brain className="h-3 w-3 mr-1" />
                      Budget
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