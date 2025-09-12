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
   * Create a new category
   */
  async create(categoryData: CategoryInsert) {
    const { data, error } = await typedSupabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error
    return data as CategoryRow
  },

  /**
   * Update a category
   */
  async update(categoryId: string, userId: string, updates: CategoryUpdate) {
    const { data, error } = await typedSupabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
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
          icon
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

/**
 * Generic error handler for Supabase operations
 */
export function handleSupabaseError(error: any, operation: string): never {
  console.error(`Supabase ${operation} error:`, error)
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`)
}

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}