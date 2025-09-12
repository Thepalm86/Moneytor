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
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  ExternalLink,
  Eye,
  Clock
} from 'lucide-react'
import { transactionOperations } from '@/lib/supabase-helpers'
import { useAuth } from '@/lib/auth-context'
import { useCachedData } from '@/hooks/use-cached-data'

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

const formatCurrency = (amount: number) => `${Math.abs(amount).toLocaleString()}₪`

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

const TransactionItem = ({ transaction, index }: { transaction: Transaction; index: number }) => {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div 
      className="group relative p-3 rounded-xl border border-border/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Enhanced Transaction Icon */}
          <motion.div 
            className={`relative h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border ${
              isIncome 
                ? 'bg-gradient-to-br from-success/20 to-success/10 border-success/20' 
                : 'bg-gradient-to-br from-muted/20 to-muted/10 border-muted/20'
            }`}
            whileHover={{ 
              scale: 1.1, 
              rotate: isIncome ? 5 : -5,
              boxShadow: isIncome 
                ? "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                : "0 10px 25px -5px rgba(148, 163, 184, 0.3)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon className={`h-6 w-6 ${isIncome ? 'text-success' : 'text-muted-foreground'}`} />
            
            {/* Background pulse animation */}
            <motion.div 
              className={`absolute inset-0 rounded-2xl opacity-0 ${
                isIncome ? 'bg-success/10' : 'bg-muted/10'
              }`}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                delay: index * 0.3
              }}
            />
          </motion.div>

          {/* Transaction Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-sm bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
              {transaction.description}
            </h4>
            
            <div className="flex items-center gap-3">
              {transaction.category && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium backdrop-blur-sm shadow-sm"
                    style={{ 
                      backgroundColor: `${transaction.category.color}15`,
                      color: transaction.category.color,
                      borderColor: `${transaction.category.color}30`
                    }}
                  >
                    {transaction.category.name}
                  </Badge>
                </motion.div>
              )}
              {transaction.tags.length > 0 && (
                <div className="flex gap-2">
                  {transaction.tags.slice(0, 2).map((tag, tagIndex) => (
                    <motion.span 
                      key={tagIndex} 
                      className="text-xs text-muted-foreground bg-gradient-to-r from-muted/10 to-muted/5 px-2 py-1 rounded-lg border border-muted/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                  {transaction.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground/70 flex items-center">
                      +{transaction.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount and Date */}
        <div className="text-right space-y-1">
          <motion.p 
            className={`font-bold text-sm ${
              isIncome ? 'text-success' : 'text-foreground'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </motion.p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="h-3 w-3" />
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const LoadingTransactions = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <motion.div 
        key={i} 
        className="flex items-center gap-4 p-4 rounded-2xl border border-border/20 bg-gradient-to-r from-muted/5 to-muted/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: i * 0.1 }}
      >
        <Skeleton className="h-12 w-12 rounded-2xl bg-muted/30" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48 bg-muted/30" />
          <Skeleton className="h-3 w-24 bg-muted/20" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-20 bg-muted/30" />
          <Skeleton className="h-3 w-16 bg-muted/20" />
        </div>
      </motion.div>
    ))}
  </div>
)

// Memoized TransactionItem to prevent unnecessary re-renders
const MemoizedTransactionItem = memo(TransactionItem)

export function RecentTransactions() {
  const { user } = useAuth()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  // Memoized fetcher function for cached data
  const fetchRecentTransactions = useCallback(async (): Promise<Transaction[]> => {
    if (!user) throw new Error('User not authenticated')
    return await transactionOperations.fetchRecent(user.id, 10)
  }, [user])

  // Use cached data with 2-minute cache for recent transactions
  const { 
    data: transactions = [], 
    loading, 
    error 
  } = useCachedData(
    ['recent-transactions', user?.id],
    fetchRecentTransactions,
    {
      ttl: 120000, // 2 minutes - more frequent for recent data
      enabled: !!user,
      staleWhileRevalidate: true
    }
  )

  if (error) {
    return (
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
        <div className="text-center py-12 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Error Loading Recent Transactions</p>
            <p className="text-sm text-muted-foreground/70">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card variant="premium" className="p-6 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
        {/* Premium background effects */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        <div className="relative z-10 space-y-4">
          {/* Enhanced Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm border border-secondary/20 flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Receipt className="h-5 w-5 text-secondary" />
              </motion.div>
              
              <div>
                <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
                <p className="text-xs text-muted-foreground/70">Latest Financial Activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs bg-gradient-to-r from-info/10 to-secondary/10 border-info/20">
                <Eye className="h-3 w-3 mr-1" />
                {transactions?.length || 0} Items
              </Badge>
              
              <Link href="/transactions">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  View All
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Compact Transactions List */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {loading ? (
              <LoadingTransactions />
            ) : !transactions || transactions.length === 0 ? (
              <motion.div 
                className="text-center py-8 space-y-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="h-12 w-12 mx-auto rounded-lg bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">No transactions yet</p>
                  <p className="text-xs text-muted-foreground/70">
                    Start adding transactions to track your activity
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/transactions">
                    <Button className="mt-4" size="lg">
                      <Receipt className="h-4 w-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence>
                <div className="space-y-1">
                  {(transactions || []).slice(0, 4).map((transaction, index) => (
                    <MemoizedTransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      index={index}
                    />
                  ))}
                  
                  {(transactions?.length || 0) > 4 && (
                    <motion.div 
                      className="pt-2 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Link href="/transactions">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          View all {transactions?.length} transactions
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}