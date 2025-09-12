'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { transactionOperations, handleSupabaseError } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionStats } from '@/components/transactions/transaction-stats';
import { TransactionList } from '@/components/transactions/transaction-list';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { BulkActions } from '@/components/transactions/bulk-actions';
import { Plus, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';

type TransactionWithCategory = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
  };
};

interface TransactionStats {
  total_transactions: number;
  total_income: number;
  total_expenses: number;
  current_balance: number;
  avg_transaction: number;
  monthly_trend: {
    percentage: number;
    isPositive: boolean;
  };
  top_category: {
    name: string;
    amount: number;
    color: string;
  } | null;
}

interface GroupedTransactions {
  [date: string]: TransactionWithCategory[];
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    category: 'all' as string,
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'year' | 'custom',
    customDateStart: '',
    customDateEnd: '',
    search: '',
    tags: [] as string[],
    sortBy: 'date' as 'date' | 'amount' | 'category' | 'created',
    sortOrder: 'desc' as 'asc' | 'desc',
    minAmount: '',
    maxAmount: ''
  });

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const transactionsData = await transactionOperations.fetchWithFilters(user.id, filters);
      setTransactions(transactionsData as TransactionWithCategory[]);
    } catch (error) {
      handleSupabaseError(error, 'fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const statsData = await transactionOperations.fetchStats(user.id);
      setStats(statsData);
    } catch (error) {
      handleSupabaseError(error, 'fetch transaction statistics');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchStats();
    }
  }, [user, fetchTransactions, fetchStats]);

  const handleTransactionCreated = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions();
    fetchStats();
  };

  const handleTransactionEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleTransactionDelete = async (transactionId: string) => {
    if (!user) return;
    
    try {
      await transactionOperations.delete(transactionId, user.id);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      handleSupabaseError(error, 'delete transaction');
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedTransactions.length === 0) return;
    
    try {
      await transactionOperations.bulkDelete(selectedTransactions, user.id);
      setSelectedTransactions([]);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      handleSupabaseError(error, 'delete transactions');
    }
  };

  const handleBulkCategoryUpdate = async (categoryId: string) => {
    if (!user || selectedTransactions.length === 0) return;
    
    try {
      await transactionOperations.bulkUpdateCategory(selectedTransactions, user.id, categoryId);
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (error) {
      handleSupabaseError(error, 'update transactions');
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  // Group transactions by date for better organization
  const groupTransactionsByDate = (transactions: TransactionWithCategory[]): GroupedTransactions => {
    return transactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as GroupedTransactions);
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    
    // Category filter
    if (filters.category !== 'all' && transaction.category_id !== filters.category) return false;
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          if (transactionDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (transactionDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          if (transactionDate < monthAgo) return false;
          break;
        case 'year':
          const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          if (transactionDate < yearAgo) return false;
          break;
        case 'custom':
          if (filters.customDateStart && transactionDate < new Date(filters.customDateStart)) return false;
          if (filters.customDateEnd && transactionDate > new Date(filters.customDateEnd)) return false;
          break;
      }
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
      const matchesCategory = transaction.category.name.toLowerCase().includes(searchLower);
      const matchesTags = transaction.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesDescription && !matchesCategory && !matchesTags) return false;
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => transaction.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Amount range filter
    if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) return false;
    
    return true;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return order * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount':
        return order * (a.amount - b.amount);
      case 'category':
        return order * a.category.name.localeCompare(b.category.name);
      case 'created':
        return order * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return 0;
    }
  });

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  if (loading) {
    return (
      <div className="pt-4 pb-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-display text-foreground">
              Transactions
            </h1>
            <p className="text-body-premium text-muted-foreground mt-1">
              Track and manage your financial transactions
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-in" style={{ animationDelay: `${i * 100}ms` }}>
              <Card variant="glass" className="p-6 animate-pulse h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-3 bg-muted/30 rounded w-20 mb-2" />
                    <div className="h-8 bg-muted/40 rounded w-28" />
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-muted/30 flex-shrink-0" />
                </div>
              </Card>
            </div>
          ))}
        </div>
        
        <div className="animate-in" style={{ animationDelay: '500ms' }}>
          <Card variant="glass" className="p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-96 bg-muted/20 rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-display text-foreground">
            Transactions
          </h1>
          <p className="text-body-premium text-muted-foreground mt-1">
            Track and manage your financial transactions
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="premium-button group"
        >
          <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="animate-in" style={{ animationDelay: '100ms' }}>
        {stats && <TransactionStats stats={stats} />}
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="animate-in" style={{ animationDelay: '200ms' }}>
          <BulkActions
            selectedCount={selectedTransactions.length}
            onBulkDelete={handleBulkDelete}
            onBulkCategoryUpdate={handleBulkCategoryUpdate}
            onDeselectAll={() => setSelectedTransactions([])}
          />
        </div>
      )}

      {/* Filters */}
      <div className="animate-in" style={{ animationDelay: '300ms' }}>
        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={transactions.length}
          filteredCount={filteredTransactions.length}
        />
      </div>

      {/* Transactions List */}
      <div className="animate-in" style={{ animationDelay: '400ms' }}>
        <TransactionList
          groupedTransactions={groupedTransactions}
          selectedTransactions={selectedTransactions}
          onEdit={handleTransactionEdit}
          onDelete={handleTransactionDelete}
          onSelect={handleSelectTransaction}
          onSelectAll={handleSelectAll}
          loading={loading}
          hasTransactions={transactions.length > 0}
          hasFilteredTransactions={filteredTransactions.length > 0}
        />
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleTransactionCreated}
        />
      )}
    </div>
  );
}