'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Filter,
  ExternalLink
} from 'lucide-react'
import { transactionOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'

interface Transaction {
  id: string
  amount: number
  description: string | null
  date: string
  type: 'income' | 'expense'
  category: {
    id: string
    name: string
    color: string
    icon: string
  } | null
  tags: string[]
}

const formatCurrency = (amount: number) => `₪${Math.abs(amount).toLocaleString()}`

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo <= 7) {
      return `${daysAgo} days ago`
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight

  return (
    <div className="group flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
      <div className="flex items-center gap-4">
        {/* Transaction Icon */}
        <div className={`
          h-10 w-10 rounded-full flex items-center justify-center
          ${isIncome ? 'bg-emerald-50' : 'bg-slate-50'}
        `}>
          <Icon className={`h-5 w-5 ${isIncome ? 'text-emerald-600' : 'text-slate-600'}`} />
        </div>

        {/* Transaction Details */}
        <div className="space-y-1">
          <p className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
            {transaction.description}
          </p>
          
          <div className="flex items-center gap-2">
            {transaction.category && (
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: `${transaction.category.color}10`,
                  color: transaction.category.color,
                  borderColor: `${transaction.category.color}20`
                }}
              >
                {transaction.category.name}
              </Badge>
            )}
            {transaction.tags.length > 0 && (
              <div className="flex gap-1">
                {transaction.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {transaction.tags.length > 2 && (
                  <span className="text-xs text-slate-400">+{transaction.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amount and Date */}
      <div className="text-right">
        <p className={`font-semibold text-sm ${
          isIncome ? 'text-emerald-600' : 'text-slate-900'
        }`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {formatDate(transaction.date)}
        </p>
      </div>
    </div>
  )
}

const LoadingTransactions = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
)

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchRecentTransactions = async () => {
      try {
        setLoading(true)
        setError(null)

        const transactions = await transactionOperations.fetchRecent(user.id, 10)
        setTransactions(transactions)
      } catch (err) {
        console.error('Error fetching recent transactions:', err)
        setError('Failed to load recent transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [user])

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Your latest financial activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {loading ? (
            <LoadingTransactions />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-rose-600 mb-2">Error loading transactions</p>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No transactions yet</p>
              <p className="text-sm text-slate-400">Start adding transactions to see them here</p>
              <Link href="/transactions">
                <Button className="mt-4" size="sm">
                  Add Your First Transaction
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
              
              {transactions.length >= 10 && (
                <div className="pt-4">
                  <Link href="/transactions">
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      View All Transactions
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}