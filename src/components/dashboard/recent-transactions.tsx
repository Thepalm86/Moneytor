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
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Filter,
  ExternalLink,
  Sparkles,
  Eye,
  Clock
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

const TransactionItem = ({ transaction, index }: { transaction: Transaction; index: number }) => {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div 
      className="group relative p-4 rounded-2xl border border-border/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-lg"
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

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

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

  if (error) {
    return (
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-destructive/20 shadow-2xl">
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
      <Card variant="premium" className="p-8 backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/98 to-card/95 border-2 border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
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
        
        <div className="relative z-10 space-y-8">
          {/* Enhanced Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm border border-secondary/20 flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 5,
                  boxShadow: "0 15px 30px -5px rgba(168, 85, 247, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Receipt className="h-7 w-7 text-secondary" />
                
                {/* Background pulse animation */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-secondary/10 opacity-0"
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
                  Recent Transactions
                </h3>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary/70" />
                  <span className="text-sm font-medium text-muted-foreground/70 tracking-wider uppercase">
                    Latest Financial Activity
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-info/10 to-secondary/10 border-info/20">
                <Eye className="h-3 w-3" />
                {transactions.length} Items
              </Badge>
              
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm font-semibold backdrop-blur-sm shadow-md"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/transactions">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm font-semibold backdrop-blur-sm shadow-md hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
                    >
                      View All
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {loading ? (
              <LoadingTransactions />
            ) : transactions.length === 0 ? (
              <motion.div 
                className="text-center py-16 space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center shadow-lg">
                  <Receipt className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-3">
                  <p className="text-muted-foreground font-semibold text-lg">No transactions yet</p>
                  <p className="text-sm text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
                    Start adding transactions to see them appear here and track your financial activity
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
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      index={index}
                    />
                  ))}
                  
                  {transactions.length >= 10 && (
                    <motion.div 
                      className="pt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: transactions.length * 0.1 }}
                    >
                      <Link href="/transactions">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            variant="outline" 
                            className="w-full text-sm font-semibold backdrop-blur-sm bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300"
                            size="lg"
                          >
                            <span className="mr-2">📊</span>
                            View All Transactions
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </motion.div>
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