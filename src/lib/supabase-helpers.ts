import type { Database } from './database.types'
import { supabase } from './supabase-client'

// Type-safe casting helper for Supabase operations
// This is a temporary workaround for SSR client type issues
const typedSupabase = supabase as any

/**
 * Type-safe Supabase database operations with proper error handling
 * This approach provides type safety while maintaining SSR compatibility
 */

// Type aliases for cleaner code
type Tables = Database['public']['Tables']
type CategoryRow = Tables['categories']['Row']
type CategoryInsert = Tables['categories']['Insert']
type CategoryUpdate = Tables['categories']['Update']
type TransactionRow = Tables['transactions']['Row']
type TransactionInsert = Tables['transactions']['Insert']
type TransactionUpdate = Tables['transactions']['Update']
type TargetRow = Tables['targets']['Row']
type TargetInsert = Tables['targets']['Insert']
type TargetUpdate = Tables['targets']['Update']
type SavingGoalRow = Tables['saving_goals']['Row']
type SavingGoalInsert = Tables['saving_goals']['Insert']
type SavingGoalUpdate = Tables['saving_goals']['Update']

// Enhanced Dashboard Operations
export const dashboardOperations = {
  /**
   * Calculate comprehensive financial health score (0-100)
   */
  async calculateFinancialHealthScore(userId: string) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch current month transactions
      const { data: currentTransactions } = await typedSupabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])

      // Fetch budget targets
      const { data: targets } = await typedSupabase
        .from('targets')
        .select('target_amount')
        .eq('user_id', userId)
        .eq('is_active', true)

      // Fetch saving goals
      const { data: goals } = await typedSupabase
        .from('saving_goals')
        .select('target_amount, current_amount, is_achieved')
        .eq('user_id', userId)

      const currentIncome = currentTransactions?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0
      const currentExpenses = currentTransactions?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0

      // Health Score Calculation (0-100)
      let score = 0
      let primaryFactor = 'Start adding transactions'
      const insights = []

      // 1. Income vs Expenses (40 points)
      if (currentIncome > 0) {
        const ratio = Math.max(0, (currentIncome - currentExpenses) / currentIncome)
        score += Math.min(40, ratio * 40)
        if (ratio > 0.2) {
          insights.push(`Great income management! You're saving ${Math.round(ratio * 100)}% of your income`)
          primaryFactor = 'Excellent spending discipline'
        } else if (ratio > 0) {
          insights.push('You have positive cash flow, but there\'s room to save more')
          primaryFactor = 'Positive but could improve'
        } else {
          insights.push('Expenses exceed income - review your spending')
          primaryFactor = 'Expenses too high'
        }
      }

      // 2. Budget Adherence (25 points)
      if (targets && targets.length > 0) {
        const totalBudget = targets.reduce((sum, t) => sum + Number(t.target_amount), 0)
        const adherenceRatio = totalBudget > 0 ? Math.max(0, 1 - (currentExpenses / totalBudget)) : 0
        score += Math.min(25, adherenceRatio * 25)
        
        if (adherenceRatio > 0.15) {
          insights.push('Staying within budget targets')
        } else {
          insights.push('Budget targets need attention')
        }
      }

      // 3. Savings Goals Progress (20 points)
      if (goals && goals.length > 0) {
        const activeGoals = goals.filter(g => !g.is_achieved)
        const completedGoals = goals.filter(g => g.is_achieved)
        const avgProgress = activeGoals.length > 0 
          ? activeGoals.reduce((sum, g) => sum + (Number(g.current_amount) / Number(g.target_amount)), 0) / activeGoals.length
          : 0
        
        score += Math.min(20, (avgProgress + (completedGoals.length * 0.1)) * 20)
        
        if (completedGoals.length > 0) {
          insights.push(`${completedGoals.length} saving goals achieved!`)
        }
        if (activeGoals.length > 0) {
          insights.push(`${activeGoals.length} savings goals in progress`)
        }
      }

      // 4. Financial Activity (15 points)
      if (currentTransactions && currentTransactions.length > 0) {
        const activityScore = Math.min(15, (currentTransactions.length / 10) * 15)
        score += activityScore
        
        if (currentTransactions.length >= 10) {
          insights.push('Good transaction tracking habits')
        }
      }

      // Determine status and trend
      let status: 'excellent' | 'good' | 'fair' | 'needs-attention'
      if (score >= 80) status = 'excellent'
      else if (score >= 65) status = 'good'
      else if (score >= 45) status = 'fair'
      else status = 'needs-attention'

      return {
        score: Math.round(score),
        status,
        primaryFactor,
        trend: 'stable' as 'improving' | 'stable' | 'declining',
        insights: insights.slice(0, 3)
      }
    } catch (error) {
      console.error('Error calculating health score:', error)
      return {
        score: 0,
        status: 'needs-attention' as const,
        primaryFactor: 'Unable to calculate',
        trend: 'stable' as const,
        insights: ['Add transactions to see your health score']
      }
    }
  },

  /**
   * Get smart action recommendations based on user context
   */
  async getSmartActionRecommendations(userId: string) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const dayOfMonth = now.getDate()
      
      // Fetch recent data for context
      const [
        { data: recentTransactions },
        { data: targets },
        { data: goals },
        { data: categories }
      ] = await Promise.all([
        typedSupabase.from('transactions').select('*').eq('user_id', userId).gte('date', startOfMonth.toISOString().split('T')[0]).order('date', { ascending: false }).limit(5),
        typedSupabase.from('targets').select('*').eq('user_id', userId).eq('is_active', true),
        typedSupabase.from('saving_goals').select('*').eq('user_id', userId).eq('is_achieved', false),
        typedSupabase.from('categories').select('id, name, type').eq('user_id', userId)
      ])

      const actions = []

      // Contextual recommendations based on patterns
      if (!recentTransactions || recentTransactions.length === 0) {
        actions.push({
          id: 'add-first-transaction',
          title: 'Add Your First Transaction',
          description: 'Start tracking your finances',
          href: '/dashboard/transactions?action=add',
          icon: 'Plus',
          priority: 'high',
          color: { bg: 'bg-primary/10', icon: 'text-primary', hover: 'bg-primary/5' }
        })
      } else if (recentTransactions.length < 3 && dayOfMonth < 5) {
        actions.push({
          id: 'add-transaction',
          title: 'Log Recent Expenses',
          description: 'Catch up on your spending',
          href: '/dashboard/transactions?action=add',
          icon: 'Receipt',
          priority: 'high',
          color: { bg: 'bg-secondary/10', icon: 'text-secondary', hover: 'bg-secondary/5' }
        })
      }

      // Budget-related actions
      if (!targets || targets.length === 0) {
        actions.push({
          id: 'create-budget',
          title: 'Create Your First Budget',
          description: 'Set spending limits for better control',
          href: '/dashboard/targets?action=add',
          icon: 'Target',
          priority: 'medium',
          color: { bg: 'bg-warning/10', icon: 'text-warning', hover: 'bg-warning/5' }
        })
      }

      // Goals-related actions
      if (!goals || goals.length === 0) {
        actions.push({
          id: 'create-goal',
          title: 'Set a Savings Goal',
          description: 'Start building your financial future',
          href: '/dashboard/goals?action=add',
          icon: 'PiggyBank',
          priority: 'medium',
          color: { bg: 'bg-success/10', icon: 'text-success', hover: 'bg-success/5' }
        })
      }

      // Categories setup
      if (!categories || categories.length < 3) {
        actions.push({
          id: 'setup-categories',
          title: 'Organize Categories',
          description: 'Better organize your transactions',
          href: '/dashboard/categories',
          icon: 'Folder',
          priority: 'low',
          color: { bg: 'bg-info/10', icon: 'text-info', hover: 'bg-info/5' }
        })
      }

      // Always include reports for users with data
      if (recentTransactions && recentTransactions.length > 5) {
        actions.push({
          id: 'view-reports',
          title: 'Analyze Spending',
          description: 'Review your financial patterns',
          href: '/dashboard/reports',
          icon: 'BarChart3',
          priority: 'low',
          color: { bg: 'bg-primary/10', icon: 'text-primary', hover: 'bg-primary/5' }
        })
      }

      // Sort by priority and return top 4
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return actions
        .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        .slice(0, 4)

    } catch (error) {
      console.error('Error getting smart actions:', error)
      return []
    }
  },

  /**
   * Get unified progress data (budgets + goals combined)
   */
  async getUnifiedProgressData(userId: string) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Fetch budget targets with spending
      const { data: targets } = await typedSupabase
        .from('targets')
        .select(`
          *,
          categories:category_id(name, color)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)

      // Fetch current month expenses for budget calculation
      const { data: expenses } = await typedSupabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString().split('T')[0])

      // Fetch saving goals
      const { data: goals } = await typedSupabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', userId)
        .order('is_achieved', { ascending: true })
        .order('target_date', { ascending: true })

      const alerts = []
      const progressItems = []

      // Process budget targets
      if (targets) {
        for (const target of targets) {
          const targetExpenses = expenses?.filter(e => 
            target.category_id ? e.category_id === target.category_id : true
          ) || []
          
          const spent = targetExpenses.reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0)
          const percentage = (spent / Number(target.target_amount)) * 100
          
          let status: 'success' | 'warning' | 'danger' = 'success'
          if (percentage >= 100) status = 'danger'
          else if (percentage >= 85) status = 'warning'

          const item = {
            id: target.id,
            type: 'budget' as const,
            title: target.name,
            subtitle: target.categories?.name || 'All categories',
            current: spent,
            target: Number(target.target_amount),
            percentage: Math.min(percentage, 100),
            status,
            color: target.categories?.color || '#8b5cf6',
            daysLeft: Math.ceil((new Date(target.period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          }

          progressItems.push(item)

          // Add to alerts if over budget or warning
          if (status !== 'success') {
            alerts.push({
              type: 'budget',
              severity: status === 'danger' ? 'high' : 'medium',
              title: `Budget Alert: ${target.name}`,
              message: status === 'danger' 
                ? `Over budget by ₪${(spent - Number(target.target_amount)).toLocaleString()}`
                : `${Math.round(percentage)}% of budget used`,
              action: 'Review spending',
              href: '/dashboard/targets'
            })
          }
        }
      }

      // Process saving goals
      if (goals) {
        for (const goal of goals) {
          const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100
          
          let status: 'success' | 'warning' | 'danger' = 'success'
          if (goal.target_date) {
            const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            if (daysLeft < 30 && percentage < 80) status = 'warning'
            if (daysLeft < 0 && !goal.is_achieved) status = 'danger'
          }

          progressItems.push({
            id: goal.id,
            type: 'goal' as const,
            title: goal.name,
            subtitle: goal.description || '',
            current: Number(goal.current_amount),
            target: Number(goal.target_amount),
            percentage: Math.min(percentage, 100),
            status: goal.is_achieved ? 'success' : status,
            color: goal.color,
            daysLeft: goal.target_date 
              ? Math.ceil((new Date(goal.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null
          })
        }
      }

      // Sort: alerts first, then by percentage completion
      progressItems.sort((a, b) => {
        if (a.status !== 'success' && b.status === 'success') return -1
        if (a.status === 'success' && b.status !== 'success') return 1
        return b.percentage - a.percentage
      })

      return {
        alerts: alerts.sort((a, b) => a.severity === 'high' ? -1 : 1),
        progressItems: progressItems.slice(0, 8), // Limit to 8 items for UI
        summary: {
          totalBudgets: targets?.length || 0,
          budgetsOnTrack: targets?.filter(t => {
            const spent = expenses?.filter(e => 
              t.category_id ? e.category_id === t.category_id : true
            )?.reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0) || 0
            return (spent / Number(t.target_amount)) < 0.85
          }).length || 0,
          totalGoals: goals?.length || 0,
          achievedGoals: goals?.filter(g => g.is_achieved).length || 0
        }
      }
    } catch (error) {
      console.error('Error getting unified progress data:', error)
      return {
        alerts: [],
        progressItems: [],
        summary: { totalBudgets: 0, budgetsOnTrack: 0, totalGoals: 0, achievedGoals: 0 }
      }
    }
  },

  /**
   * Get financial insights and recommendations
   */
  async getFinancialInsights(userId: string) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch transaction data
      const [
        { data: currentTransactions },
        { data: lastMonthTransactions },
        { data: categories }
      ] = await Promise.all([
        typedSupabase.from('transactions').select('*').eq('user_id', userId).gte('date', startOfMonth.toISOString().split('T')[0]),
        typedSupabase.from('transactions').select('*').eq('user_id', userId).gte('date', startOfLastMonth.toISOString().split('T')[0]).lte('date', endOfLastMonth.toISOString().split('T')[0]),
        typedSupabase.from('categories').select('*').eq('user_id', userId)
      ])

      const insights = []

      // Spending pattern analysis
      if (currentTransactions && lastMonthTransactions) {
        const currentSpending = currentTransactions.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
        const lastMonthSpending = lastMonthTransactions.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

        if (currentSpending > lastMonthSpending * 1.2) {
          insights.push({
            type: 'warning',
            title: 'Spending Increase Detected',
            message: `Your spending is ${Math.round(((currentSpending - lastMonthSpending) / lastMonthSpending) * 100)}% higher than last month`,
            action: 'Review transactions',
            icon: 'TrendingUp'
          })
        } else if (currentSpending < lastMonthSpending * 0.8) {
          insights.push({
            type: 'success',
            title: 'Great Spending Control',
            message: `You've reduced spending by ${Math.round(((lastMonthSpending - currentSpending) / lastMonthSpending) * 100)}% vs last month`,
            action: 'Keep it up!',
            icon: 'TrendingDown'
          })
        }
      }

      // Category spending patterns
      if (currentTransactions && categories) {
        const categorySpending = currentTransactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            const categoryId = t.category_id || 'uncategorized'
            acc[categoryId] = (acc[categoryId] || 0) + Math.abs(Number(t.amount))
            return acc
          }, {} as Record<string, number>)

        const topCategory = Object.entries(categorySpending)
          .sort(([,a], [,b]) => b - a)[0]

        if (topCategory) {
          const category = categories.find(c => c.id === topCategory[0])
          insights.push({
            type: 'info',
            title: 'Top Spending Category',
            message: `${category?.name || 'Uncategorized'}: ₪${topCategory[1].toLocaleString()}`,
            action: 'Analyze category',
            icon: 'PieChart'
          })
        }
      }

      return insights.slice(0, 3)
    } catch (error) {
      console.error('Error getting financial insights:', error)
      return []
    }
  }
}

// Category Operations
export const categoryOperations = {
  /**
   * Fetch all categories for a user with usage statistics
   */
  async fetchWithStats(userId: string) {
    const { data, error } = await typedSupabase
      .from('categories')
      .select(`
        *,
        transactions(amount, date)
      `)
      .eq('user_id', userId)
      .order('name')

    if (error) throw error

    // Process categories to calculate usage stats
    const categoriesWithUsage = (data || []).map((category: any) => {
      const transactions = category.transactions || []
      const transaction_count = transactions.length
      const total_amount = transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
      const avg_amount = transaction_count > 0 ? total_amount / transaction_count : 0
      const last_used = transactions.length > 0 
        ? transactions.reduce((latest: string, t: any) => 
            new Date(t.date) > new Date(latest) ? t.date : latest, transactions[0].date)
        : null

      return {
        ...category,
        transaction_count,
        total_amount,
        avg_amount,
        last_used
      }
    })

    return categoriesWithUsage
  },

  /**
   * Check if category name already exists for user and type
   */
  async checkDuplicate(userId: string, name: string, type: 'income' | 'expense'): Promise<boolean> {
    const { data, error } = await typedSupabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name.trim())
      .eq('type', type)
      .limit(1)

    if (error) throw error
    return data.length > 0
  },

  /**
   * Create a new category with duplicate checking
   */
  async create(categoryData: CategoryInsert) {
    // Check for duplicates first
    const isDuplicate = await this.checkDuplicate(
      categoryData.user_id, 
      categoryData.name, 
      categoryData.type
    )
    
    if (isDuplicate) {
      throw new Error(`A ${categoryData.type} category named "${categoryData.name}" already exists. Please use a different name.`)
    }

    const { data, error } = await typedSupabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('categories_user_id_name_type_key')) {
        throw new Error(`A ${categoryData.type} category named "${categoryData.name}" already exists. Please use a different name.`)
      }
      throw error
    }
    return data as CategoryRow
  },

  /**
   * Update a category with duplicate checking
   */
  async update(categoryId: string, userId: string, updates: CategoryUpdate) {
    // If name or type is being updated, check for duplicates
    if (updates.name || updates.type) {
      const { data: currentCategory } = await typedSupabase
        .from('categories')
        .select('name, type')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single()

      if (currentCategory) {
        const newName = updates.name || currentCategory.name
        const newType = updates.type || currentCategory.type
        
        // Check if the new combination would create a duplicate (excluding current category)
        const { data: duplicates, error: duplicateError } = await typedSupabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', newName.trim())
          .eq('type', newType)
          .neq('id', categoryId)
          .limit(1)

        if (duplicateError) throw duplicateError
        
        if (duplicates.length > 0) {
          throw new Error(`A ${newType} category named "${newName}" already exists. Please use a different name.`)
        }
      }
    }

    const { data, error } = await typedSupabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('categories_user_id_name_type_key')) {
        throw new Error(`A category with that name already exists. Please use a different name.`)
      }
      throw error
    }
    return data as CategoryRow
  },

  /**
   * Delete a category
   */
  async delete(categoryId: string, userId: string) {
    const { error } = await typedSupabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Toggle category active status
   */
  async toggleStatus(categoryId: string, userId: string, currentStatus: boolean) {
    return this.update(categoryId, userId, { is_active: !currentStatus })
  },

  /**
   * Fetch categories for statistics
   */
  async fetchForStats(userId: string) {
    const { data, error } = await typedSupabase
      .from('categories')
      .select(`
        *,
        transactions(amount)
      `)
      .eq('user_id', userId)

    if (error) throw error

    const categoriesData = data || []
    const total_categories = categoriesData.length
    const income_categories = categoriesData.filter((c: any) => c.type === 'income').length
    const expense_categories = categoriesData.filter((c: any) => c.type === 'expense').length
    
    const categoriesWithStats = categoriesData.map((category: any) => ({
      ...category,
      transaction_count: category.transactions.length,
      total_amount: category.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    }))

    const most_used_category = categoriesWithStats.reduce((max: any, current: any) => 
      current.transaction_count > (max?.transaction_count || 0) ? current : max, null)

    const total_transactions = categoriesWithStats.reduce((sum: number, cat: any) => sum + cat.transaction_count, 0)

    return {
      total_categories,
      income_categories,
      expense_categories,
      most_used_category,
      total_transactions
    }
  }
}

// Transaction Operations
export const transactionOperations = {
  /**
   * Fetch recent transactions with category information
   */
  async fetchRecent(userId: string, limit: number = 5) {
    const { data, error } = await typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((transaction: any) => ({
      ...transaction,
      category: transaction.categories
    }))
  },

  /**
   * Fetch all transactions with advanced filtering
   */
  async fetchWithFilters(userId: string, filters: any) {
    let query = typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', userId)

    // Apply filters
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category)
    }

    // Date range filtering
    if (filters.dateRange && filters.dateRange !== 'all') {
      const today = new Date()
      let startDate: Date

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          query = query.gte('date', startDate.toISOString().split('T')[0])
          break
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          query = query.gte('date', startDate.toISOString().split('T')[0])
          break
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          query = query.gte('date', startDate.toISOString().split('T')[0])
          break
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1)
          query = query.gte('date', startDate.toISOString().split('T')[0])
          break
        case 'custom':
          if (filters.customDateStart) {
            query = query.gte('date', filters.customDateStart)
          }
          if (filters.customDateEnd) {
            query = query.lte('date', filters.customDateEnd)
          }
          break
      }
    }

    // Amount range filtering
    if (filters.minAmount) {
      query = query.gte('amount', parseFloat(filters.minAmount))
    }
    if (filters.maxAmount) {
      query = query.lte('amount', parseFloat(filters.maxAmount))
    }

    // Apply sorting
    if (filters.sortBy === 'date') {
      query = query.order('date', { ascending: filters.sortOrder === 'asc' })
    } else if (filters.sortBy === 'amount') {
      query = query.order('amount', { ascending: filters.sortOrder === 'asc' })
    } else if (filters.sortBy === 'created') {
      query = query.order('created_at', { ascending: filters.sortOrder === 'asc' })
    }

    // Default secondary sort by date desc
    query = query.order('date', { ascending: false })
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    let filteredData = (data || []).map((transaction: any) => ({
      ...transaction,
      category: transaction.categories
    }))

    // Apply client-side filters that can't be done in SQL
    
    // Search filter (description and category name)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim()
      filteredData = filteredData.filter((transaction: any) => 
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm)) ||
        (transaction.category && transaction.category.name.toLowerCase().includes(searchTerm))
      )
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredData = filteredData.filter((transaction: any) => 
        filters.tags.some((tag: string) => 
          transaction.tags && transaction.tags.includes(tag)
        )
      )
    }

    return filteredData
  },

  /**
   * Create a new transaction
   */
  async create(transactionData: TransactionInsert) {
    // Validate category exists and belongs to user
    const { data: category, error: categoryError } = await typedSupabase
      .from('categories')
      .select('id, type')
      .eq('id', transactionData.category_id)
      .eq('user_id', transactionData.user_id)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      throw new Error('Selected category not found or inactive')
    }

    // Validate transaction type matches category type
    if (category.type !== transactionData.type) {
      throw new Error(`Transaction type (${transactionData.type}) must match category type (${category.type})`)
    }

    const { data, error } = await typedSupabase
      .from('transactions')
      .insert(transactionData)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      category: data.categories
    }
  },

  /**
   * Update a transaction
   */
  async update(transactionId: string, userId: string, updates: TransactionUpdate) {
    // If category is being updated, validate it
    if (updates.category_id) {
      const { data: category, error: categoryError } = await typedSupabase
        .from('categories')
        .select('id, type')
        .eq('id', updates.category_id)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        throw new Error('Selected category not found or inactive')
      }

      // If type is also being updated, validate they match
      if (updates.type && category.type !== updates.type) {
        throw new Error(`Transaction type (${updates.type}) must match category type (${category.type})`)
      }
    }

    const { data, error } = await typedSupabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      category: data.categories
    }
  },

  /**
   * Delete a transaction
   */
  async delete(transactionId: string, userId: string) {
    const { error } = await typedSupabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Bulk delete transactions
   */
  async bulkDelete(transactionIds: string[], userId: string) {
    const { error } = await typedSupabase
      .from('transactions')
      .delete()
      .in('id', transactionIds)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Bulk update transaction category
   */
  async bulkUpdateCategory(transactionIds: string[], userId: string, categoryId: string) {
    // Validate category exists and belongs to user
    const { data: category, error: categoryError } = await typedSupabase
      .from('categories')
      .select('id, type')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      throw new Error('Selected category not found or inactive')
    }

    const { error } = await typedSupabase
      .from('transactions')
      .update({ category_id: categoryId })
      .in('id', transactionIds)
      .eq('user_id', userId)
      .eq('type', category.type) // Only update transactions of matching type

    if (error) throw error
  },

  /**
   * Bulk add tags to transactions
   */
  async bulkAddTags(transactionIds: string[], userId: string, tags: string[]) {
    // Get current transactions to merge tags
    const { data: transactions, error: fetchError } = await typedSupabase
      .from('transactions')
      .select('id, tags')
      .in('id', transactionIds)
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    // Update each transaction with merged tags
    const updates = transactions.map((transaction: any) => {
      const currentTags = transaction.tags || []
      const newTags = Array.from(new Set([...currentTags, ...tags])) // Remove duplicates
      
      return typedSupabase
        .from('transactions')
        .update({ tags: newTags })
        .eq('id', transaction.id)
        .eq('user_id', userId)
    })

    await Promise.all(updates)
  },

  /**
   * Get transaction statistics
   */
  async fetchStats(userId: string) {
    const { data: transactions, error } = await typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          color,
          type
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    const transactionsData = transactions || []
    const total_transactions = transactionsData.length

    const income_transactions = transactionsData.filter((t: any) => t.type === 'income')
    const expense_transactions = transactionsData.filter((t: any) => t.type === 'expense')

    const total_income = income_transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const total_expenses = expense_transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const current_balance = total_income - total_expenses

    const avg_transaction = total_transactions > 0 ? (total_income + total_expenses) / total_transactions : 0

    // Calculate monthly trend (comparing this month vs last month)
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const currentMonthTransactions = transactionsData.filter((t: any) => 
      new Date(t.date) >= currentMonth
    )
    const lastMonthTransactions = transactionsData.filter((t: any) => {
      const date = new Date(t.date)
      return date >= lastMonth && date <= lastMonthEnd
    })

    const currentMonthCount = currentMonthTransactions.length
    const lastMonthCount = lastMonthTransactions.length

    const monthly_trend = {
      percentage: lastMonthCount > 0 ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0,
      isPositive: currentMonthCount >= lastMonthCount
    }

    // Find top category by spending
    const categorySpending = transactionsData.reduce((acc: any, t: any) => {
      const categoryName = t.categories?.name || 'Unknown'
      const categoryColor = t.categories?.color || '#6366f1'
      
      if (!acc[categoryName]) {
        acc[categoryName] = { amount: 0, color: categoryColor }
      }
      acc[categoryName].amount += Number(t.amount)
      return acc
    }, {})

    const top_category = Object.keys(categorySpending).length > 0 
      ? Object.entries(categorySpending).reduce((top: any, [name, data]: [string, any]) => 
          data.amount > (top?.amount || 0) ? { name, ...data } : top, null)
      : null

    return {
      total_transactions,
      total_income,
      total_expenses,
      current_balance,
      avg_transaction,
      monthly_trend,
      top_category
    }
  },

  /**
   * Get all unique tags from user's transactions
   */
  async getUniqueTags(userId: string): Promise<string[]> {
    const { data, error } = await typedSupabase
      .from('transactions')
      .select('tags')
      .eq('user_id', userId)

    if (error) throw error

    const allTags = (data || []).flatMap((transaction: any) => (transaction.tags || []) as string[])
    return Array.from(new Set(allTags)).sort() as string[]
  },


  /**
   * Get period totals for dashboard
   */
  async getPeriodTotals(userId: string, startDate: string, endDate: string) {
    const { data: incomeData, error: incomeError } = await typedSupabase
      .rpc('get_period_income', {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      })

    if (incomeError) throw incomeError

    const { data: expenseData, error: expenseError } = await typedSupabase
      .rpc('get_period_expenses', {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      })

    if (expenseError) throw expenseError

    return {
      income: incomeData || 0,
      expenses: expenseData || 0
    }
  }
}

// Target Operations
export const targetOperations = {
  /**
   * Fetch all targets for a user with spending progress
   */
  async fetchWithProgress(userId: string) {
    const { data, error } = await typedSupabase
      .from('targets')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate spending progress for each target
    const targetsWithProgress = await Promise.all((data || []).map(async (target: any) => {
      // Calculate current spending within target period
      let spentQuery = typedSupabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', target.period_start)
        .lte('date', target.period_end)

      // If target is category-specific, filter by category
      if (target.category_id) {
        spentQuery = spentQuery.eq('category_id', target.category_id)
      }

      const { data: transactions, error: spentError } = await spentQuery

      if (spentError) throw spentError

      const current_spending = transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
      const progress_percentage = target.target_amount > 0 ? (current_spending / target.target_amount) * 100 : 0
      const remaining_amount = Math.max(0, target.target_amount - current_spending)
      const days_remaining = Math.max(0, Math.ceil((new Date(target.period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      
      // Calculate status
      let status: 'on_track' | 'warning' | 'exceeded' | 'completed' = 'on_track'
      if (!target.is_active) {
        status = 'completed'
      } else if (current_spending > target.target_amount) {
        status = 'exceeded'
      } else if (progress_percentage > 80) {
        status = 'warning'
      }

      return {
        ...target,
        category: target.categories,
        current_spending,
        progress_percentage: Math.min(100, progress_percentage),
        remaining_amount,
        days_remaining,
        status
      }
    }))

    return targetsWithProgress
  },

  /**
   * Create a new target
   */
  async create(targetData: TargetInsert) {
    // Validate category exists and belongs to user if category_id is provided
    if (targetData.category_id) {
      const { data: category, error: categoryError } = await typedSupabase
        .from('categories')
        .select('id, type')
        .eq('id', targetData.category_id)
        .eq('user_id', targetData.user_id)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        throw new Error('Selected category not found or inactive')
      }

      // Only allow expense categories for targets
      if (category.type !== 'expense') {
        throw new Error('Budget targets can only be set for expense categories')
      }
    }

    // Validate period dates
    if (new Date(targetData.period_start) >= new Date(targetData.period_end)) {
      throw new Error('Period start date must be before the end date')
    }

    const { data, error } = await typedSupabase
      .from('targets')
      .insert(targetData)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      category: data.categories
    }
  },

  /**
   * Update a target
   */
  async update(targetId: string, userId: string, updates: TargetUpdate) {
    // If category is being updated, validate it
    if (updates.category_id) {
      const { data: category, error: categoryError } = await typedSupabase
        .from('categories')
        .select('id, type')
        .eq('id', updates.category_id)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        throw new Error('Selected category not found or inactive')
      }

      // Only allow expense categories for targets
      if (category.type !== 'expense') {
        throw new Error('Budget targets can only be set for expense categories')
      }
    }

    // Validate period dates if being updated
    if (updates.period_start || updates.period_end) {
      const { data: currentTarget } = await typedSupabase
        .from('targets')
        .select('period_start, period_end')
        .eq('id', targetId)
        .eq('user_id', userId)
        .single()

      if (currentTarget) {
        const startDate = updates.period_start || currentTarget.period_start
        const endDate = updates.period_end || currentTarget.period_end
        
        if (new Date(startDate) >= new Date(endDate)) {
          throw new Error('Period start date must be before the end date')
        }
      }
    }

    const { data, error } = await typedSupabase
      .from('targets')
      .update(updates)
      .eq('id', targetId)
      .eq('user_id', userId)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      category: data.categories
    }
  },

  /**
   * Delete a target
   */
  async delete(targetId: string, userId: string) {
    const { error } = await typedSupabase
      .from('targets')
      .delete()
      .eq('id', targetId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Toggle target active status
   */
  async toggleStatus(targetId: string, userId: string, currentStatus: boolean) {
    return this.update(targetId, userId, { is_active: !currentStatus })
  },

  /**
   * Get target statistics for dashboard
   */
  async fetchStats(userId: string) {
    const targets = await this.fetchWithProgress(userId)
    
    const active_targets = targets.filter(t => t.is_active)
    const total_targets = targets.length
    const on_track_targets = active_targets.filter(t => t.status === 'on_track').length
    const warning_targets = active_targets.filter(t => t.status === 'warning').length
    const exceeded_targets = active_targets.filter(t => t.status === 'exceeded').length
    
    const total_budget = active_targets.reduce((sum, t) => sum + t.target_amount, 0)
    const total_spent = active_targets.reduce((sum, t) => sum + t.current_spending, 0)
    const remaining_budget = total_budget - total_spent
    
    const avg_progress = active_targets.length > 0 
      ? active_targets.reduce((sum, t) => sum + t.progress_percentage, 0) / active_targets.length
      : 0

    // Find target closest to limit
    const closest_to_limit = active_targets
      .filter(t => t.status === 'warning' || t.status === 'exceeded')
      .sort((a, b) => b.progress_percentage - a.progress_percentage)[0] || null

    return {
      total_targets,
      active_targets: active_targets.length,
      on_track_targets,
      warning_targets,
      exceeded_targets,
      total_budget,
      total_spent,
      remaining_budget,
      avg_progress,
      closest_to_limit
    }
  },

  /**
   * Get spending data for target progress tracking
   */
  async getSpendingProgress(userId: string, targetId: string) {
    // Get target details
    const { data: target, error: targetError } = await typedSupabase
      .from('targets')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', targetId)
      .eq('user_id', userId)
      .single()

    if (targetError || !target) {
      throw new Error('Target not found')
    }

    // Get transactions within target period
    let transactionsQuery = typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', target.period_start)
      .lte('date', target.period_end)
      .order('date', { ascending: false })

    // Filter by category if target is category-specific
    if (target.category_id) {
      transactionsQuery = transactionsQuery.eq('category_id', target.category_id)
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery

    if (transactionsError) throw transactionsError

    // Calculate daily spending for progress chart
    const dailySpending = (transactions || []).reduce((acc: any, transaction: any) => {
      const date = transaction.date
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += transaction.amount
      return acc
    }, {})

    // Generate cumulative spending data for chart
    const startDate = new Date(target.period_start)
    const endDate = new Date(target.period_end)
    const chartData = []
    let cumulativeSpending = 0

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dailyAmount = dailySpending[dateStr] || 0
      cumulativeSpending += dailyAmount
      
      chartData.push({
        date: dateStr,
        daily_spending: dailyAmount,
        cumulative_spending: cumulativeSpending,
        target_amount: target.target_amount
      })
    }

    return {
      target: {
        ...target,
        category: target.categories
      },
      transactions: (transactions || []).map((t: any) => ({
        ...t,
        category: t.categories
      })),
      chartData,
      current_spending: cumulativeSpending,
      progress_percentage: target.target_amount > 0 ? (cumulativeSpending / target.target_amount) * 100 : 0
    }
  },

  /**
   * Generate period dates based on period type
   */
  generatePeriodDates(periodType: 'weekly' | 'monthly' | 'yearly', startDate?: Date) {
    const baseDate = startDate || new Date()
    
    switch (periodType) {
      case 'weekly': {
        const startOfWeek = new Date(baseDate)
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()) // Start on Sunday
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // End on Saturday
        
        return {
          period_start: startOfWeek.toISOString().split('T')[0],
          period_end: endOfWeek.toISOString().split('T')[0]
        }
      }
      
      case 'monthly': {
        const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
        const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)
        
        return {
          period_start: startOfMonth.toISOString().split('T')[0],
          period_end: endOfMonth.toISOString().split('T')[0]
        }
      }
      
      case 'yearly': {
        const startOfYear = new Date(baseDate.getFullYear(), 0, 1)
        const endOfYear = new Date(baseDate.getFullYear(), 11, 31)
        
        return {
          period_start: startOfYear.toISOString().split('T')[0],
          period_end: endOfYear.toISOString().split('T')[0]
        }
      }
      
      default:
        throw new Error('Invalid period type')
    }
  }
}

// Saving Goal Operations
export const savingGoalOperations = {
  /**
   * Fetch all saving goals for a user with progress calculations
   */
  async fetchWithProgress(userId: string) {
    const { data, error } = await typedSupabase
      .from('saving_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate progress for each goal
    const goalsWithProgress = (data || []).map((goal: any) => {
      const progress_percentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
      const remaining_amount = Math.max(0, goal.target_amount - goal.current_amount)
      
      // Calculate days remaining if target_date is set
      const days_remaining = goal.target_date 
        ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null
      
      // Calculate status
      let status: 'on_track' | 'behind' | 'achieved' | 'overdue' = 'on_track'
      if (goal.is_achieved || goal.current_amount >= goal.target_amount) {
        status = 'achieved'
      } else if (goal.target_date && new Date(goal.target_date) < new Date() && !goal.is_achieved) {
        status = 'overdue'
      } else if (goal.target_date && days_remaining && days_remaining < 30 && progress_percentage < 80) {
        status = 'behind'
      }

      return {
        ...goal,
        progress_percentage: Math.min(100, progress_percentage),
        remaining_amount,
        days_remaining,
        status
      }
    })

    return goalsWithProgress
  },

  /**
   * Create a new saving goal
   */
  async create(goalData: SavingGoalInsert) {
    // Validate target amount is positive
    if (goalData.target_amount <= 0) {
      throw new Error('Target amount must be greater than zero')
    }

    // Validate current amount is not negative
    if (goalData.current_amount && goalData.current_amount < 0) {
      throw new Error('Current amount cannot be negative')
    }

    // Validate target date is in the future if provided
    if (goalData.target_date && new Date(goalData.target_date) <= new Date()) {
      throw new Error('Target date must be in the future')
    }

    const { data, error } = await typedSupabase
      .from('saving_goals')
      .insert(goalData)
      .select()
      .single()

    if (error) throw error
    return data as SavingGoalRow
  },

  /**
   * Update a saving goal
   */
  async update(goalId: string, userId: string, updates: SavingGoalUpdate) {
    // Validate target amount if being updated
    if (updates.target_amount !== undefined && updates.target_amount <= 0) {
      throw new Error('Target amount must be greater than zero')
    }

    // Validate current amount if being updated
    if (updates.current_amount !== undefined && updates.current_amount < 0) {
      throw new Error('Current amount cannot be negative')
    }

    // Validate target date if being updated
    if (updates.target_date && new Date(updates.target_date) <= new Date()) {
      throw new Error('Target date must be in the future')
    }

    const { data, error } = await typedSupabase
      .from('saving_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as SavingGoalRow
  },

  /**
   * Delete a saving goal
   */
  async delete(goalId: string, userId: string) {
    const { error } = await typedSupabase
      .from('saving_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Add funds to a saving goal
   */
  async addFunds(goalId: string, userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero')
    }

    // Get current goal data
    const { data: goal, error: fetchError } = await typedSupabase
      .from('saving_goals')
      .select('current_amount, target_amount')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !goal) {
      throw new Error('Saving goal not found')
    }

    const newCurrentAmount = goal.current_amount + amount
    const isNowAchieved = newCurrentAmount >= goal.target_amount

    const { data, error } = await typedSupabase
      .from('saving_goals')
      .update({
        current_amount: newCurrentAmount,
        is_achieved: isNowAchieved,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as SavingGoalRow
  },

  /**
   * Withdraw funds from a saving goal
   */
  async withdrawFunds(goalId: string, userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero')
    }

    // Get current goal data
    const { data: goal, error: fetchError } = await typedSupabase
      .from('saving_goals')
      .select('current_amount, target_amount')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !goal) {
      throw new Error('Saving goal not found')
    }

    const newCurrentAmount = Math.max(0, goal.current_amount - amount)
    const isStillAchieved = newCurrentAmount >= goal.target_amount

    if (newCurrentAmount < 0) {
      throw new Error('Cannot withdraw more than the current amount')
    }

    const { data, error } = await typedSupabase
      .from('saving_goals')
      .update({
        current_amount: newCurrentAmount,
        is_achieved: isStillAchieved,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as SavingGoalRow
  },

  /**
   * Toggle goal achievement status
   */
  async toggleAchieved(goalId: string, userId: string, currentStatus: boolean) {
    return this.update(goalId, userId, { is_achieved: !currentStatus })
  },

  /**
   * Get saving goal statistics for dashboard
   */
  async fetchStats(userId: string) {
    const goals = await this.fetchWithProgress(userId)
    
    const total_goals = goals.length
    const achieved_goals = goals.filter((g: any) => g.is_achieved).length
    const active_goals = goals.filter((g: any) => !g.is_achieved).length
    const overdue_goals = goals.filter((g: any) => g.status === 'overdue').length
    
    const total_target_amount = goals.reduce((sum: number, g: any) => sum + g.target_amount, 0)
    const total_saved_amount = goals.reduce((sum: number, g: any) => sum + g.current_amount, 0)
    const total_remaining = total_target_amount - total_saved_amount
    
    const avg_progress = active_goals > 0 
      ? goals.filter((g: any) => !g.is_achieved).reduce((sum: number, g: any) => sum + g.progress_percentage, 0) / active_goals
      : 0

    // Find goal closest to completion (non-achieved goals only)
    const closest_to_completion = goals
      .filter((g: any) => !g.is_achieved)
      .sort((a: any, b: any) => b.progress_percentage - a.progress_percentage)[0] || null

    // Calculate monthly savings rate based on recent progress
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // This would ideally track historical amounts, but for now we'll estimate
    const estimated_monthly_savings = total_saved_amount / Math.max(1, (new Date().getTime() - new Date(goals[0]?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30))

    return {
      total_goals,
      active_goals,
      achieved_goals,
      overdue_goals,
      total_target_amount,
      total_saved_amount,
      total_remaining,
      avg_progress,
      closest_to_completion,
      estimated_monthly_savings: Math.max(0, estimated_monthly_savings),
      achievement_rate: total_goals > 0 ? (achieved_goals / total_goals) * 100 : 0
    }
  },

  /**
   * Get progress history for a specific goal (for charts)
   */
  async getProgressHistory(goalId: string, userId: string) {
    // Get goal details
    const { data: goal, error: goalError } = await typedSupabase
      .from('saving_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single()

    if (goalError || !goal) {
      throw new Error('Saving goal not found')
    }

    // For now, return current progress as a single point
    // In a full implementation, you'd track historical changes
    const currentProgress = {
      date: new Date().toISOString().split('T')[0],
      amount: goal.current_amount,
      progress_percentage: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
    }

    // Generate projected completion date based on current progress
    let projected_completion: string | null = null
    if (goal.target_date && !goal.is_achieved && goal.current_amount > 0) {
      const daysElapsed = Math.ceil((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const dailySavingsRate = goal.current_amount / Math.max(1, daysElapsed)
      const remainingAmount = goal.target_amount - goal.current_amount
      const daysToCompletion = Math.ceil(remainingAmount / Math.max(0.01, dailySavingsRate))
      
      const projectedDate = new Date()
      projectedDate.setDate(projectedDate.getDate() + daysToCompletion)
      projected_completion = projectedDate.toISOString().split('T')[0]
    }

    return {
      goal,
      currentProgress,
      projected_completion,
      chartData: [currentProgress] // Would include historical data in full implementation
    }
  }
}

/**
 * Generic error handler for Supabase operations with user-friendly messages
 */
export function handleSupabaseError(error: any, operation: string): never {
  console.error(`Supabase ${operation} error:`, error)
  
  // Handle specific database constraint errors with user-friendly messages
  if (error?.code === '23505') {
    if (error.message.includes('categories_user_id_name_type_key')) {
      throw new Error('A category with that name and type already exists. Please choose a different name.')
    }
    if (error.message.includes('unique')) {
      throw new Error('This item already exists. Please use a different name.')
    }
  }
  
  // Handle foreign key constraint errors
  if (error?.code === '23503') {
    throw new Error('Cannot delete this item because it is being used elsewhere. Please remove all related items first.')
  }
  
  // Handle permission errors
  if (error?.code === '42501' || error?.message?.includes('permission')) {
    throw new Error('You do not have permission to perform this action.')
  }
  
  // Handle not found errors
  if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
    throw new Error('The requested item was not found.')
  }
  
  // Handle network/connection errors
  if (error?.message?.includes('network') || error?.message?.includes('connection')) {
    throw new Error('Connection error. Please check your internet connection and try again.')
  }
  
  // Default user-friendly message
  const userMessage = error?.message || 'An unexpected error occurred'
  throw new Error(`Failed to ${operation}: ${userMessage}`)
}

// Analytics Operations for Reports Dashboard
export const analyticsOperations = {
  /**
   * Get spending analytics overview for reports
   */
  async getSpendingOverview(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const { data: transactions, error } = await typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon,
          type
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('date', { ascending: false })

    if (error) throw error

    const transactionsData = transactions || []
    
    // Calculate period boundaries
    const now = new Date()
    let periodStart: Date
    
    switch (period) {
      case 'week':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'year':
        periodStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    const periodTransactions = transactionsData.filter((t: any) => 
      new Date(t.date) >= periodStart
    )

    const total_spent = periodTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    const transaction_count = periodTransactions.length
    const avg_transaction = transaction_count > 0 ? total_spent / transaction_count : 0

    // Category breakdown
    const categoryBreakdown = periodTransactions.reduce((acc: any, t: any) => {
      const categoryName = t.categories?.name || 'Uncategorized'
      const categoryColor = t.categories?.color || '#6366f1'
      
      if (!acc[categoryName]) {
        acc[categoryName] = { 
          amount: 0, 
          count: 0, 
          color: categoryColor,
          percentage: 0 
        }
      }
      acc[categoryName].amount += t.amount
      acc[categoryName].count += 1
      return acc
    }, {})

    // Calculate percentages
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].percentage = total_spent > 0 
        ? (categoryBreakdown[category].amount / total_spent) * 100 
        : 0
    })

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      period,
      total_spent,
      transaction_count,
      avg_transaction,
      categoryBreakdown,
      topCategories
    }
  },

  /**
   * Get monthly spending comparison data
   */
  async getMonthlyComparison(userId: string, months: number = 6) {
    const { data: transactions, error } = await typedSupabase
      .from('transactions')
      .select(`
        amount,
        date,
        type,
        categories (
          name,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error

    const transactionsData = transactions || []
    const monthlyData: any[] = []

    // Generate data for the last N months
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthTransactions = transactionsData.filter((t: any) => {
        const date = new Date(t.date)
        return date >= monthStart && date <= monthEnd
      })

      const income = monthTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0)

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthKey: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
        income,
        expenses,
        net: income - expenses,
        transactionCount: monthTransactions.length
      })
    }

    return monthlyData
  },

  /**
   * Get expense trends over time
   */
  async getExpenseTrends(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    const { data: transactions, error } = await typedSupabase
      .from('transactions')
      .select(`
        amount,
        date,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    const transactionsData = transactions || []
    const trendData: any[] = []

    if (period === 'daily') {
      // Group by day
      const dailySpending = transactionsData.reduce((acc: any, t: any) => {
        const date = t.date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += t.amount
        return acc
      }, {})

      // Fill in missing days with 0
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        trendData.push({
          date: dateStr,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: dailySpending[dateStr] || 0
        })
      }
    }

    return trendData
  },

  /**
   * Get comprehensive budget performance analysis
   */
  async getBudgetPerformance(userId: string) {
    // Get current month's targets and their performance
    const targets = await targetOperations.fetchWithProgress(userId)
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    const currentMonthTargets = targets.filter((t: any) => {
      const targetStart = t.period_start.slice(0, 7)
      return targetStart === currentMonth && t.is_active
    })

    const totalBudget = currentMonthTargets.reduce((sum: number, t: any) => sum + t.target_amount, 0)
    const totalSpent = currentMonthTargets.reduce((sum: number, t: any) => sum + t.current_spending, 0)
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Calculate performance by category
    const categoryPerformance = currentMonthTargets.map((target: any) => ({
      categoryName: target.category?.name || 'General',
      categoryColor: target.category?.color || '#6366f1',
      budgetAmount: target.target_amount,
      spentAmount: target.current_spending,
      utilization: target.progress_percentage,
      status: target.status,
      remainingAmount: target.remaining_amount,
      daysRemaining: target.days_remaining
    }))

    // Historical performance (last 6 months)
    const monthlyPerformance = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      
      // This would ideally query historical target data
      // For now, we'll use a simplified approach
      monthlyPerformance.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        budgetUtilization: Math.random() * 100, // Placeholder - would be actual data
        overBudgetCategories: Math.floor(Math.random() * 3)
      })
    }

    return {
      currentMonth: {
        totalBudget,
        totalSpent,
        budgetUtilization,
        targetsCount: currentMonthTargets.length,
        onTrackCount: currentMonthTargets.filter((t: any) => t.status === 'on_track').length,
        warningCount: currentMonthTargets.filter((t: any) => t.status === 'warning').length,
        exceededCount: currentMonthTargets.filter((t: any) => t.status === 'exceeded').length
      },
      categoryPerformance,
      monthlyPerformance
    }
  },

  /**
   * Get goals progress analytics
   */
  async getGoalsAnalytics(userId: string) {
    const goals = await savingGoalOperations.fetchWithProgress(userId)
    
    const totalGoals = goals.length
    const activeGoals = goals.filter((g: any) => !g.is_achieved)
    const achievedGoals = goals.filter((g: any) => g.is_achieved)
    
    const totalTargetAmount = goals.reduce((sum: number, g: any) => sum + g.target_amount, 0)
    const totalSavedAmount = goals.reduce((sum: number, g: any) => sum + g.current_amount, 0)
    const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0

    // Goals by status
    const goalsByStatus = {
      on_track: goals.filter((g: any) => g.status === 'on_track').length,
      behind: goals.filter((g: any) => g.status === 'behind').length,
      achieved: achievedGoals.length,
      overdue: goals.filter((g: any) => g.status === 'overdue').length
    }

    // Top performing goals
    const topGoals = goals
      .filter((g: any) => !g.is_achieved)
      .sort((a: any, b: any) => b.progress_percentage - a.progress_percentage)
      .slice(0, 5)
      .map((goal: any) => ({
        name: goal.name,
        color: goal.color,
        progress: goal.progress_percentage,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        status: goal.status
      }))

    // Monthly savings trend (simplified)
    const monthlySavings = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      // This would ideally track actual monthly contributions
      // For now, we'll estimate based on current progress
      const estimatedMonthlySaving = totalSavedAmount / Math.max(1, goals.length * 6) // Rough estimate
      
      monthlySavings.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: estimatedMonthlySaving + (Math.random() - 0.5) * estimatedMonthlySaving * 0.3
      })
    }

    return {
      overview: {
        totalGoals,
        activeGoals: activeGoals.length,
        achievedGoals: achievedGoals.length,
        totalTargetAmount,
        totalSavedAmount,
        overallProgress,
        achievementRate: totalGoals > 0 ? (achievedGoals.length / totalGoals) * 100 : 0
      },
      goalsByStatus,
      topGoals,
      monthlySavings
    }
  },

  /**
   * Get comprehensive financial summary for reports
   */
  async getFinancialSummary(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    // Get transactions for the period
    const now = new Date()
    let periodStart: Date
    
    switch (period) {
      case 'quarter':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'year':
        periodStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default: // month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const { data: transactions, error } = await typedSupabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .gte('date', periodStart.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) throw error

    const transactionsData = transactions || []
    
    const income = transactionsData
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    
    const expenses = transactionsData
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const netIncome = income - expenses
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

    // Get goals and targets summary
    const goalsStats = await savingGoalOperations.fetchStats(userId)
    const targetsStats = await targetOperations.fetchStats(userId)

    return {
      period,
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: now.toISOString().split('T')[0],
      financial: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        savingsRate,
        transactionCount: transactionsData.length
      },
      goals: {
        totalGoals: goalsStats.total_goals,
        achievedGoals: goalsStats.achieved_goals,
        totalSaved: goalsStats.total_saved_amount,
        progressRate: goalsStats.avg_progress
      },
      budgets: {
        activeTargets: targetsStats.active_targets,
        budgetUtilization: targetsStats.total_budget > 0 ? (targetsStats.total_spent / targetsStats.total_budget) * 100 : 0,
        exceededTargets: targetsStats.exceeded_targets
      }
    }
  }
}

// Achievement Operations
type AchievementRow = Tables['achievements']['Row']
type UserAchievementRow = Tables['user_achievements']['Row']
type UserAchievementInsert = Tables['user_achievements']['Insert']
type UserAchievementUpdate = Tables['user_achievements']['Update']

export const achievementOperations = {
  /**
   * Fetch all achievements with user progress
   */
  async fetchAll(userId: string) {
    const { data, error } = await typedSupabase
      .from('achievements')
      .select(`
        *,
        user_achievements!user_achievements_achievement_id_fkey(
          id,
          earned_at,
          progress
        )
      `)
      .eq('is_active', true)
      .eq('user_achievements.user_id', userId)
      .order('points', { ascending: true })

    if (error) throw error

    // Transform data to include user progress
    return (data || []).map((achievement: any) => {
      const userAchievement = achievement.user_achievements?.[0]
      return {
        ...achievement,
        isEarned: !!userAchievement?.earned_at,
        earnedAt: userAchievement?.earned_at || null,
        progress: userAchievement?.progress || null,
        userAchievementId: userAchievement?.id || null
      }
    })
  },

  /**
   * Fetch user's earned achievements
   */
  async fetchEarned(userId: string) {
    const { data, error } = await typedSupabase
      .from('user_achievements')
      .select(`
        *,
        achievements(*)
      `)
      .eq('user_id', userId)
      .not('earned_at', 'is', null)
      .order('earned_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Fetch achievement statistics for user
   */
  async fetchStats(userId: string) {
    const { data: allAchievements, error: achievementsError } = await typedSupabase
      .from('achievements')
      .select('id, points, category')
      .eq('is_active', true)

    if (achievementsError) throw achievementsError

    const { data: userAchievements, error: userError } = await typedSupabase
      .from('user_achievements')
      .select(`
        *,
        achievements(points, category)
      `)
      .eq('user_id', userId)
      .not('earned_at', 'is', null)

    if (userError) throw userError

    const totalAchievements = allAchievements?.length || 0
    const earnedAchievements = userAchievements?.length || 0
    const totalPoints = (userAchievements || []).reduce((sum: number, ua: any) => 
      sum + (ua.achievements?.points || 0), 0)

    // Category breakdown
    const categoryBreakdown = {
      saving: 0,
      spending: 0,
      budgeting: 0,
      consistency: 0
    }

    ;(userAchievements || []).forEach((ua: any) => {
      const category = ua.achievements?.category
      if (category && categoryBreakdown.hasOwnProperty(category)) {
        categoryBreakdown[category as keyof typeof categoryBreakdown]++
      }
    })

    return {
      totalAchievements,
      earnedAchievements,
      totalPoints,
      completionRate: totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0,
      categoryBreakdown
    }
  },

  /**
   * Check if user meets achievement criteria
   */
  async checkEligibility(userId: string, achievementId: string) {
    // Get achievement criteria
    const { data: achievement, error: achievementError } = await typedSupabase
      .from('achievements')
      .select('criteria, category')
      .eq('id', achievementId)
      .eq('is_active', true)
      .single()

    if (achievementError || !achievement) return false

    // Check if already earned
    const { data: existing, error: existingError } = await typedSupabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .not('earned_at', 'is', null)
      .limit(1)

    if (existingError) return false
    if (existing && existing.length > 0) return false

    const criteria = achievement.criteria as any

    // Get user data based on achievement category
    switch (achievement.category) {
      case 'saving':
        return await this.checkSavingCriteria(userId, criteria)
      case 'spending':
        return await this.checkSpendingCriteria(userId, criteria)
      case 'budgeting':
        return await this.checkBudgetingCriteria(userId, criteria)
      case 'consistency':
        return await this.checkConsistencyCriteria(userId, criteria)
      default:
        return false
    }
  },

  /**
   * Check saving-related achievement criteria
   */
  async checkSavingCriteria(userId: string, criteria: any) {
    if (criteria.type === 'total_saved') {
      const { data, error } = await typedSupabase
        .from('saving_goals')
        .select('current_amount')
        .eq('user_id', userId)

      if (error) return false

      const totalSaved = (data || []).reduce((sum: number, goal: any) => sum + goal.current_amount, 0)
      return totalSaved >= criteria.target
    }

    if (criteria.type === 'goals_completed') {
      const { data, error } = await typedSupabase
        .from('saving_goals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'achieved')

      if (error) return false
      return (data?.length || 0) >= criteria.count
    }

    return false
  },

  /**
   * Check spending-related achievement criteria
   */
  async checkSpendingCriteria(userId: string, criteria: any) {
    if (criteria.type === 'transaction_count') {
      const { data, error } = await typedSupabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)

      if (error) return false
      return (data?.length || 0) >= criteria.count
    }

    if (criteria.type === 'category_spending') {
      const { data, error } = await typedSupabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', criteria.categoryId)
        .eq('type', 'expense')

      if (error) return false

      const totalSpent = (data || []).reduce((sum: number, t: any) => sum + t.amount, 0)
      return totalSpent <= criteria.maxAmount
    }

    return false
  },

  /**
   * Check budgeting-related achievement criteria
   */
  async checkBudgetingCriteria(userId: string, criteria: any) {
    if (criteria.type === 'targets_met') {
      const stats = await targetOperations.fetchStats(userId)
      return stats.on_track_targets >= criteria.count
    }

    if (criteria.type === 'budget_adherence') {
      const stats = await targetOperations.fetchStats(userId)
      const adherenceRate = stats.total_budget > 0 ? 
        ((stats.total_budget - stats.total_spent) / stats.total_budget) * 100 : 0
      return adherenceRate >= criteria.percentage
    }

    return false
  },

  /**
   * Check consistency-related achievement criteria
   */
  async checkConsistencyCriteria(userId: string, criteria: any) {
    if (criteria.type === 'daily_transactions') {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - criteria.days)

      const { data, error } = await typedSupabase
        .from('transactions')
        .select('date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) return false

      // Count unique days with transactions
      const uniqueDays = new Set((data || []).map((t: any) => t.date)).size
      return uniqueDays >= criteria.days
    }

    return false
  },

  /**
   * Award achievement to user
   */
  async award(userId: string, achievementId: string, progress?: any) {
    const achievementData: UserAchievementInsert = {
      user_id: userId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString(),
      progress: progress || null
    }

    const { data, error } = await typedSupabase
      .from('user_achievements')
      .insert(achievementData)
      .select(`
        *,
        achievements(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update achievement progress (for partial achievements)
   */
  async updateProgress(userId: string, achievementId: string, progress: any) {
    const { data, error } = await typedSupabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress: progress,
        earned_at: null
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}