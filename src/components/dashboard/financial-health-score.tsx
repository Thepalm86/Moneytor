'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  ArrowRight
} from 'lucide-react'
import { dashboardOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'

interface HealthScore {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'needs-attention'
  primaryFactor: string
  trend: 'improving' | 'stable' | 'declining'
  insights: string[]
}

const statusConfig = {
  'excellent': {
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    icon: CheckCircle,
    badge: 'success' as const,
    label: 'Excellent',
    description: 'Outstanding financial health'
  },
  'good': {
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    icon: Heart,
    badge: 'default' as const,
    label: 'Good',
    description: 'Strong financial foundation'
  },
  'fair': {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    icon: AlertTriangle,
    badge: 'warning' as const,
    label: 'Fair',
    description: 'Room for improvement'
  },
  'needs-attention': {
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    icon: AlertCircle,
    badge: 'destructive' as const,
    label: 'Needs Attention',
    description: 'Focus on financial health'
  }
}

const trendIcons = {
  'improving': TrendingUp,
  'stable': Minus,
  'declining': TrendingDown
}

const trendColors = {
  'improving': 'text-success',
  'stable': 'text-muted-foreground',
  'declining': 'text-destructive'
}

interface CircularProgressProps {
  score: number
  status: HealthScore['status']
  size?: number
}

const CircularProgress = ({ score, status, size = 120 }: CircularProgressProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const config = statusConfig[status]

  return (
    <motion.div 
      ref={ref}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -180 }}
      animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.3
      }}
    >
      {/* Background circle */}
      <svg
        className="absolute transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={8}
          fill="none"
          className="text-border/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          className={config.color}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        />
      </svg>

      {/* Score display */}
      <motion.div 
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.p 
          className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent"
          animate={inView ? { 
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ 
            duration: 0.6, 
            delay: 1.5,
            repeat: 1,
            repeatType: "reverse"
          }}
        >
          {score}
        </motion.p>
        <p className="text-xs font-medium text-muted-foreground/70 tracking-wider uppercase mt-1">
          Score
        </p>
      </motion.div>

      {/* Animated glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${config.bgColor} opacity-0`}
        animate={{
          opacity: [0, 0.3, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.div>
  )
}

interface InsightCardProps {
  insight: string
  index: number
}

const InsightCard = ({ insight, index }: InsightCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
    >
      <Card variant="glass" className="p-4 backdrop-blur-sm border border-primary/10">
        <div className="flex items-start gap-3">
          <motion.div
            className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary mt-2 flex-shrink-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3
            }}
          />
          <p className="text-sm font-medium text-body-premium leading-relaxed">
            {insight}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

const LoadingHealthScore = () => (
  <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Loading circle */}
      <div className="relative">
        <Skeleton className="h-32 w-32 rounded-full bg-muted/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-8 w-12 bg-muted/40" />
        </div>
      </div>

      {/* Loading content */}
      <div className="flex-1 text-center lg:text-left space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 bg-muted/30 mx-auto lg:mx-0" />
          <Skeleton className="h-8 w-48 bg-muted/40 mx-auto lg:mx-0" />
          <Skeleton className="h-4 w-64 bg-muted/30 mx-auto lg:mx-0" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-16 w-full bg-muted/20" />
          <Skeleton className="h-16 w-full bg-muted/20" />
        </div>
      </div>
    </div>
  </Card>
)

export function FinancialHealthScore() {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchHealthScore = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardOperations.calculateFinancialHealthScore(user.id)
        setHealthData(data)
      } catch (err) {
        console.error('Error fetching health score:', err)
        setError('Unable to calculate health score')
      } finally {
        setLoading(false)
      }
    }

    fetchHealthScore()
  }, [user])

  if (loading) {
    return <LoadingHealthScore />
  }

  if (error || !healthData) {
    return (
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-medium">Unable to Calculate Health Score</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  const config = statusConfig[healthData.status]
  const TrendIcon = trendIcons[healthData.trend]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl relative overflow-hidden">
        {/* Premium background effects */}
        <motion.div 
          className={`absolute inset-0 ${config.bgColor} opacity-0`}
          animate={{
            opacity: [0, 0.03, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />

        {/* Animated border glow */}
        <motion.div 
          className={`absolute inset-0 rounded-2xl border ${config.borderColor} opacity-0`}
          animate={{
            opacity: [0, 0.5, 0],
            boxShadow: [
              "0 0 0 0 rgba(139, 92, 246, 0)",
              "0 0 30px 0 rgba(139, 92, 246, 0.1)",
              "0 0 0 0 rgba(139, 92, 246, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 5,
                  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Zap className="h-6 w-6 text-primary" />
                
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                  Financial Health Score
                </h2>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary/70" />
                  <span className="text-xs font-medium text-muted-foreground/70 tracking-wider uppercase">
                    Your Financial Wellness
                  </span>
                </div>
              </div>
            </div>

            <Badge variant={config.badge} className="flex items-center gap-2 text-sm font-semibold px-4 py-2">
              <StatusIcon className="h-4 w-4" />
              {config.label}
            </Badge>
          </motion.div>

          {/* Main content */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Circular Progress */}
            <div className="flex-shrink-0">
              <CircularProgress 
                score={healthData.score} 
                status={healthData.status}
                size={140}
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Status and trend */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-display">
                    {config.description}
                  </h3>
                  <p className="text-body-premium font-medium">
                    {healthData.primaryFactor}
                  </p>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-border/20 to-border/10 backdrop-blur-sm border border-border/30`}>
                    <TrendIcon className={`h-4 w-4 ${trendColors[healthData.trend]}`} />
                    <span className="text-sm font-medium capitalize text-muted-foreground">
                      {healthData.trend}
                    </span>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm font-semibold backdrop-blur-sm bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/30 shadow-md"
                    >
                      <span className="mr-2">📊</span>
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Insights */}
              <div className="space-y-3">
                <motion.h4 
                  className="text-sm font-semibold text-muted-foreground/90 tracking-wider uppercase text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                >
                  Key Insights
                </motion.h4>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {healthData.insights.map((insight, index) => (
                      <InsightCard 
                        key={index} 
                        insight={insight} 
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}