'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Plus, 
  Receipt, 
  Target, 
  PiggyBank, 
  Folder, 
  BarChart3,
  ArrowRight,
  Zap,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react'
import { dashboardOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'

interface SmartAction {
  id: string
  title: string
  description: string
  href: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  color: {
    bg: string
    icon: string
    hover: string
  }
}

const iconMap = {
  'Plus': Plus,
  'Receipt': Receipt,
  'Target': Target,
  'PiggyBank': PiggyBank,
  'Folder': Folder,
  'BarChart3': BarChart3,
  'TrendingUp': TrendingUp,
  'Clock': Clock,
  'Star': Star
}

const priorityConfig = {
  'high': {
    badge: 'HIGH PRIORITY',
    badgeColor: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertCircle,
    pulse: true
  },
  'medium': {
    badge: 'RECOMMENDED',
    badgeColor: 'bg-warning/10 text-warning border-warning/20',
    icon: Star,
    pulse: false
  },
  'low': {
    badge: 'SUGGESTED',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    icon: Brain,
    pulse: false
  }
}

interface SmartQuickActionProps extends SmartAction {
  index: number
}

const SmartQuickAction = ({ title, description, href, icon, color, priority, index }: SmartQuickActionProps) => {
  const Icon = iconMap[icon as keyof typeof iconMap] || Plus
  const priorityInfo = priorityConfig[priority]
  const PriorityIcon = priorityInfo.icon

  return (
    <Link href={href} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.3 + index * 0.1,
          ease: [0.21, 0.47, 0.32, 0.98]
        }}
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          variant="interactive" 
          className="p-6 group relative overflow-hidden backdrop-blur-sm border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Priority badge */}
          {priority === 'high' && (
            <motion.div 
              className="absolute top-3 right-3 z-20"
              animate={priorityInfo.pulse ? {
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${priorityInfo.badgeColor} border backdrop-blur-sm`}>
                <PriorityIcon className="h-3 w-3" />
                {priorityInfo.badge}
              </div>
            </motion.div>
          )}

          {/* Enhanced gradient overlay with animation */}
          <motion.div 
            className={`absolute inset-0 ${color.hover} opacity-0 group-hover:opacity-100`}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {/* Animated border glow */}
          <motion.div 
            className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-hover:opacity-100"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 20px 0 rgba(139, 92, 246, 0.1)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <div className="relative flex items-center gap-5 z-10">
            {/* Enhanced icon container */}
            <motion.div 
              className={`relative h-16 w-16 rounded-2xl ${color.bg} backdrop-blur-sm border border-border/30 flex items-center justify-center shadow-lg group-hover:shadow-xl flex-shrink-0`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 8,
                boxShadow: "0 15px 30px -5px rgba(139, 92, 246, 0.25)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className={`h-7 w-7 ${color.icon}`} />
              
              {/* Icon background pulse for high priority */}
              {priority === 'high' && (
                <motion.div 
                  className={`absolute inset-0 rounded-2xl ${color.bg} opacity-0 group-hover:opacity-70`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              )}
            </motion.div>
            
            <div className="flex-1 space-y-2">
              <motion.h4 
                className="text-lg font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary/90 group-hover:to-primary/80"
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h4>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed pr-8">
                {description}
              </p>
              
              {/* Priority indicator */}
              {priority !== 'low' && (
                <div className="flex items-center gap-2 mt-2">
                  <PriorityIcon className={`h-3 w-3 ${priority === 'high' ? 'text-destructive' : 'text-warning'}`} />
                  <span className={`text-xs font-semibold tracking-wider uppercase ${priority === 'high' ? 'text-destructive' : 'text-warning'}`}>
                    {priorityInfo.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced arrow with better animation */}
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex-shrink-0"
              whileHover={{ 
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                borderColor: "rgba(139, 92, 246, 0.3)",
                scale: 1.05
              }}
            >
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  duration: 1.8, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <ArrowRight className="h-5 w-5 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

const LoadingSkeleton = () => (
  <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl animate-pulse">
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl bg-muted/30" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-muted/30" />
          <Skeleton className="h-4 w-64 bg-muted/30" />
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/10">
            <Skeleton className="h-12 w-12 rounded-xl bg-muted/30" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-muted/30" />
              <Skeleton className="h-3 w-48 bg-muted/30" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg bg-muted/30" />
          </div>
        ))}
      </div>
    </div>
  </Card>
)

export function SmartQuickActions() {
  const { user } = useAuth()
  const [actions, setActions] = useState<SmartAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (!user) return

    const fetchSmartActions = async () => {
      try {
        setLoading(true)
        setError(null)
        const smartActions = await dashboardOperations.getSmartActionRecommendations(user.id)
        setActions(smartActions)
      } catch (err) {
        console.error('Error fetching smart actions:', err)
        setError('Unable to load recommendations')
        // Fallback to static actions
        setActions([
          {
            id: 'add-transaction',
            title: 'Add Transaction',
            description: 'Record a new income or expense',
            href: '/dashboard/transactions?action=add',
            icon: 'Plus',
            priority: 'high',
            color: {
              bg: 'bg-primary/10',
              icon: 'text-primary',
              hover: 'bg-primary/5'
            }
          },
          {
            id: 'view-reports',
            title: 'View Reports',
            description: 'Analyze your financial trends',
            href: '/dashboard/reports',
            icon: 'BarChart3',
            priority: 'medium',
            color: {
              bg: 'bg-success/10',
              icon: 'text-success',
              hover: 'bg-success/5'
            }
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchSmartActions()
  }, [user])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    return <LoadingSkeleton />
  }

  if (error && actions.length === 0) {
    return (
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Unable to Load Smart Actions</p>
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
          {/* Enhanced Premium Header */}
          <motion.div className="space-y-4" variants={childVariants}>
            <div className="flex items-center justify-between">
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
                  <Brain className="h-7 w-7 text-primary" />
                  
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
                    Smart Actions
                  </h3>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary/70" />
                    <span className="text-xs font-medium text-muted-foreground/70 tracking-wider uppercase">
                      AI-Powered Recommendations
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Badge */}
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {actions.filter(a => a.priority === 'high').length > 0 ? 'Priority Actions' : 'Personalized'}
                </span>
              </motion.div>
            </div>
            
            <p className="text-base font-medium text-muted-foreground/80 max-w-2xl leading-relaxed">
              Personalized recommendations based on your financial activity and goals
            </p>
          </motion.div>

          {/* Smart Actions Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={childVariants}
          >
            <AnimatePresence>
              {actions.map((action, index) => (
                <SmartQuickAction
                  key={action.id}
                  {...action}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Premium Footer */}
          <motion.div 
            className="pt-6 border-t border-gradient-to-r from-transparent via-border to-transparent"
            variants={childVariants}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                <Brain className="h-4 w-4" />
                <span>Updated based on your recent activity</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/achievements">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm font-semibold backdrop-blur-sm bg-gradient-to-r from-warning/10 to-secondary/10 border-warning/20 hover:border-warning/30 shadow-md"
                    >
                      <span className="mr-2">🏆</span>
                      Achievements
                    </Button>
                  </motion.div>
                </Link>
                
                <Link href="/dashboard/settings">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm font-semibold backdrop-blur-sm bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20 hover:border-secondary/30 shadow-md"
                    >
                      <span className="mr-2">⚙️</span>
                      Settings
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}