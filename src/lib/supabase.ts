// Type definitions and helper functions for Supabase
import type { Database } from './database.types'

// Table types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Target = Database['public']['Tables']['targets']['Row']
export type TargetInsert = Database['public']['Tables']['targets']['Insert']
export type TargetUpdate = Database['public']['Tables']['targets']['Update']

export type SavingGoal = Database['public']['Tables']['saving_goals']['Row']
export type SavingGoalInsert = Database['public']['Tables']['saving_goals']['Insert']
export type SavingGoalUpdate = Database['public']['Tables']['saving_goals']['Update']

export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']

// Enum types
export type TransactionType = Database['public']['Enums']['transaction_type']
export type PeriodType = Database['public']['Enums']['period_type']
export type AchievementCategory = Database['public']['Enums']['achievement_category']

// Extended types with relations
export type TransactionWithCategory = Transaction & {
  categories: Category
}

export type TargetWithCategory = Target & {
  categories: Category | null
}

export type CategoryWithStats = Category & {
  transaction_count?: number
  total_amount?: number
}

// Default categories for new users
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { name: 'Freelance', icon: 'Users', color: '#3b82f6' },
  { name: 'Investment', icon: 'TrendingUp', color: '#8b5cf6' },
  { name: 'Gift', icon: 'Gift', color: '#f59e0b' },
  { name: 'Other Income', icon: 'Plus', color: '#6b7280' },
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#ef4444' },
  { name: 'Transportation', icon: 'Car', color: '#f97316' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Entertainment', icon: 'Film', color: '#8b5cf6' },
  { name: 'Bills & Utilities', icon: 'Receipt', color: '#06b6d4' },
  { name: 'Healthcare', icon: 'Heart', color: '#10b981' },
  { name: 'Education', icon: 'BookOpen', color: '#3b82f6' },
  { name: 'Travel', icon: 'MapPin', color: '#f59e0b' },
  { name: 'Home & Garden', icon: 'Home', color: '#84cc16' },
  { name: 'Other Expenses', icon: 'Minus', color: '#6b7280' },
]

// Utility functions
export function getTransactionTypeColor(type: TransactionType): string {
  return type === 'income' ? 'text-green-600' : 'text-red-600'
}

export function getTransactionTypeBgColor(type: TransactionType): string {
  return type === 'income' ? 'bg-green-50' : 'bg-red-50'
}

export function getPeriodDates(periodType: PeriodType, startDate?: Date): { start: Date; end: Date } {
  const now = startDate || new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (periodType) {
    case 'weekly':
      start.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
      end.setDate(start.getDate() + 6) // End of week (Saturday)
      break
    case 'monthly':
      start.setDate(1) // Start of month
      end.setMonth(start.getMonth() + 1, 0) // End of month
      break
    case 'yearly':
      start.setMonth(0, 1) // Start of year
      end.setMonth(11, 31) // End of year
      break
  }

  return { start, end }
}