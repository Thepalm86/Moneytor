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

/**
 * Type guard to check if a value is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}