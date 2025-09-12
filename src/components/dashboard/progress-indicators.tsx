'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Plus,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { targetOperations, savingGoalOperations } from '@/lib/supabase-helpers'
import { supabase } from '@/lib/supabase-client'

interface BudgetTarget {
  id: string
  name: string
  target_amount: number
  spent: number
  percentage: number
  period_end: string
  category: {
    name: string
    color: string
  } | null
  daysLeft: number
  status: 'on-track' | 'warning' | 'over-budget'
}

interface SavingGoal {
  id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  percentage: number
  is_achieved: boolean
  color: string
}

const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`

const getDaysLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getBudgetStatus = (percentage: number): BudgetTarget['status'] => {
  if (percentage >= 100) return 'over-budget'
  if (percentage >= 85) return 'warning'
  return 'on-track'
}

const BudgetProgressCard = ({ budget }: { budget: BudgetTarget }) => {
  const statusConfig = {
    'on-track': {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      badge: 'success' as const
    },
    'warning': {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badge: 'warning' as const
    },
    'over-budget': {
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      badge: 'destructive' as const
    }
  }

  const config = statusConfig[budget.status]

  return (
    <Card className="p-5 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-slate-900">{budget.name}</h4>
            {budget.category && (
              <p className="text-sm text-slate-500">{budget.category.name}</p>
            )}
          </div>
          <Badge variant={config.badge} className="text-xs">
            {Math.round(budget.percentage)}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              {formatCurrency(budget.spent)} spent
            </span>
            <span className="font-medium">
              {formatCurrency(budget.target_amount)} budget
            </span>
          </div>
          
          <Progress 
            value={Math.min(budget.percentage, 100)} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between text-xs">
            <span className={config.color}>
              {budget.percentage >= 100 
                ? `₪${(budget.spent - budget.target_amount).toLocaleString()} over budget`
                : `₪${(budget.target_amount - budget.spent).toLocaleString()} remaining`
              }
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {budget.daysLeft > 0 ? `${budget.daysLeft} days left` : 'Expired'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

const GoalProgressCard = ({ goal }: { goal: SavingGoal }) => {
  const isNearTarget = goal.percentage >= 90
  
  return (
    <Card className="p-5 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              {goal.name}
              {goal.is_achieved && (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              )}
            </h4>
            {goal.description && (
              <p className="text-sm text-slate-500">{goal.description}</p>
            )}
          </div>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              {formatCurrency(goal.current_amount)} saved
            </span>
            <span className="font-medium">
              {formatCurrency(goal.target_amount)} goal
            </span>
          </div>
          
          <Progress 
            value={Math.min(goal.percentage, 100)} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between text-xs">
            <span className={`${
              goal.is_achieved 
                ? 'text-emerald-600' 
                : isNearTarget 
                ? 'text-amber-600' 
                : 'text-slate-600'
            }`}>
              {goal.is_achieved 
                ? 'Goal achieved!'
                : `${Math.round(goal.percentage)}% complete`
              }
            </span>
            {goal.target_date && (
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(goal.target_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

const LoadingCards = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[...Array(count)].map((_, i) => (
      <Card key={i} className="p-5 bg-white/60 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
)

export function BudgetProgress() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetTarget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchBudgets = async () => {
      try {
        setLoading(true)
        
        // Use the new targetOperations to get targets with real spending progress
        const targets = await targetOperations.fetchWithProgress(user.id)
        
        // Filter active targets and limit to 4 for dashboard
        const activeTargets = targets
          .filter(target => target.is_active)
          .slice(0, 4)

        // Transform to BudgetTarget format
        const budgetData: BudgetTarget[] = activeTargets.map(target => ({
          id: target.id,
          name: target.name,
          target_amount: target.target_amount,
          spent: target.current_spending,
          percentage: target.progress_percentage,
          period_end: target.period_end,
          category: target.category,
          daysLeft: target.days_remaining,
          status: target.status === 'on_track' 
            ? 'on-track' 
            : target.status === 'warning' 
            ? 'warning' 
            : 'over-budget'
        }))

        setBudgets(budgetData)
      } catch (error) {
        console.error('Error fetching budgets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [user])

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Budget Progress
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Track your spending against budget targets
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/targets">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
            <Link href="/dashboard/targets">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingCards count={2} />
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No budget targets set</p>
            <p className="text-sm text-slate-400 mb-4">
              Create budget targets to track your spending
            </p>
            <Link href="/dashboard/targets">
              <Button size="sm">
                Create Your First Budget
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(budget => (
              <BudgetProgressCard key={budget.id} budget={budget} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export function SavingGoalsProgress() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchGoals = async () => {
      try {
        setLoading(true)
        
        // Use the new savingGoalOperations to get goals with progress
        const goalsData = await savingGoalOperations.fetchWithProgress(user.id)
        
        // Limit to 6 for dashboard display
        const limitedGoals = goalsData.slice(0, 6)
        
        // Transform to SavingGoal format
        const goalData: SavingGoal[] = limitedGoals.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          description: goal.description,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          target_date: goal.target_date,
          percentage: goal.progress_percentage,
          is_achieved: goal.is_achieved,
          color: goal.color || '#3b82f6'
        }))

        setGoals(goalData)
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [user])

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-blue-600" />
              Saving Goals
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Track progress towards your financial goals
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/goals">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
            <Link href="/dashboard/goals">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingCards count={3} />
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No saving goals yet</p>
            <p className="text-sm text-slate-400 mb-4">
              Set financial goals to track your progress
            </p>
            <Link href="/dashboard/goals">
              <Button size="sm">
                Create Your First Goal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}