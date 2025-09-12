'use client'

import { useState, useEffect } from 'react'
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
        className={`p-6 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm border ${config.border} ${config.bg}`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div 
              className={`relative h-12 w-12 rounded-2xl ${config.bg} backdrop-blur-sm border ${config.border} flex items-center justify-center shadow-sm flex-shrink-0 group-hover:shadow-md`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className={`h-6 w-6 ${config.color}`} />
              
              {/* Background pulse for warnings */}
              {type === 'warning' && (
                <motion.div 
                  className={`absolute inset-0 rounded-2xl ${config.bg} opacity-0`}
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
  <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
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

export function SmartInsightsPanel() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (!user) return

    const fetchInsights = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardOperations.getFinancialInsights(user.id)
        setInsights(data)
      } catch (err) {
        console.error('Error fetching insights:', err)
        setError('Unable to load insights')
        // Fallback to sample insights
        setInsights([
          {
            type: 'info',
            title: 'Welcome to Moneytor',
            message: 'Start by adding your first transaction to begin tracking your finances',
            action: 'Add Transaction',
            icon: 'Info'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [user])

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
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
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
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <motion.div className="space-y-4" variants={childVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-info/20 to-info/10 backdrop-blur-sm border border-info/20 flex items-center justify-center shadow-lg"
                  whileHover={{ 
                    scale: 1.05, 
                    rotate: 5,
                    boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Brain className="h-7 w-7 text-info" />
                  
                  {/* Background pulse animation */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl bg-info/10 opacity-0"
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
                    Smart Insights
                  </h3>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-info/70" />
                    <span className="text-xs font-medium text-muted-foreground/70 tracking-wider uppercase">
                      AI-Powered Financial Analysis
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-info/10 to-primary/10 border-info/20">
                  <Zap className="h-3 w-3" />
                  {insights.length} Insight{insights.length > 1 ? 's' : ''}
                </Badge>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm font-semibold backdrop-blur-sm bg-gradient-to-r from-info/10 to-secondary/10 border-info/20 hover:border-info/30 shadow-md"
                    asChild
                  >
                    <Link href="/dashboard/reports">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Full Reports
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
            
            <p className="text-base font-medium text-muted-foreground/80 max-w-2xl leading-relaxed">
              Intelligent analysis of your financial patterns with personalized recommendations
            </p>
          </motion.div>

          {/* Insights Grid */}
          {insights.length > 0 ? (
            <motion.div 
              className="space-y-4"
              variants={childVariants}
            >
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    {...insight}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12 space-y-4"
              variants={childVariants}
            >
              <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-info/10 to-primary/10 flex items-center justify-center shadow-lg">
                <Brain className="h-10 w-10 text-info" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">Building your insights...</p>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
                  Add more transactions and set up budgets to unlock personalized financial insights and recommendations
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/transactions?action=add">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/targets?action=add">
                    <Brain className="h-4 w-4 mr-2" />
                    Create Budget
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div 
            className="pt-6 border-t border-gradient-to-r from-transparent via-border to-transparent"
            variants={childVariants}
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-info" />
                <span>Insights updated in real-time</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}