'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { transactionOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionStats } from '@/components/transactions/transaction-stats';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { TransactionList } from '@/components/transactions/transaction-list';
import { BulkActions } from '@/components/transactions/bulk-actions';
import { Plus } from 'lucide-react';

interface TransactionFilters {
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  customDateStart: string;
  customDateEnd: string;
  minAmount: string;
  maxAmount: string;
  search: string;
  tags: string[];
  sortBy: 'date' | 'amount' | 'category' | 'created';
  sortOrder: 'asc' | 'desc';
}

export function TransactionsTab() {
  const { user } = useAuth();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    customDateStart: '',
    customDateEnd: '',
    minAmount: '',
    maxAmount: '',
    search: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Load transactions based on filters
  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch filtered transactions
      const filteredData = await transactionOperations.fetchWithFilters(user.id, filters);
      setTransactions(filteredData);
      
      // If this is the first load or no filters applied, also load all transactions for count
      if (allTransactions.length === 0 || (
        filters.type === 'all' && 
        filters.category === 'all' && 
        filters.dateRange === 'all' && 
        filters.search === '' && 
        filters.tags.length === 0 && 
        filters.minAmount === '' && 
        filters.maxAmount === ''
      )) {
        setAllTransactions(filteredData);
      } else if (allTransactions.length === 0) {
        // Load all transactions for count
        const allData = await transactionOperations.fetchWithFilters(user.id, {
          type: 'all',
          category: 'all',
          dateRange: 'all',
          customDateStart: '',
          customDateEnd: '',
          minAmount: '',
          maxAmount: '',
          search: '',
          tags: [],
          sortBy: 'date',
          sortOrder: 'desc'
        });
        setAllTransactions(allData);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user, filters]);

  const handleTransactionSubmit = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
    setError(null); // Clear any previous errors
    loadTransactions();
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await transactionOperations.delete(transactionId, user.id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedTransactions.length === 0) return;
    
    try {
      setIsBulkProcessing(true);
      setError(null);
      await transactionOperations.bulkDelete(selectedTransactions, user.id);
      setSelectedTransactions([]);
      loadTransactions();
    } catch (error) {
      console.error('Error bulk deleting transactions:', error);
      setError('Failed to delete selected transactions. Please try again.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCategoryUpdate = async (categoryId: string) => {
    if (!user || selectedTransactions.length === 0) return;
    
    try {
      setIsBulkProcessing(true);
      setError(null);
      await transactionOperations.bulkUpdateCategory(selectedTransactions, categoryId, user.id);
      setSelectedTransactions([]);
      loadTransactions();
    } catch (error) {
      console.error('Error bulk updating transaction categories:', error);
      setError('Failed to update transaction categories. Please try again.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDeselectAll = () => {
    setSelectedTransactions([]);
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions: any[]) => {
    const grouped = transactions.reduce((groups: any, transaction: any) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    const sortedGroups: any = {};
    sortedDates.forEach(date => {
      sortedGroups[date] = grouped[date];
    });

    return sortedGroups;
  };

  // Calculate transaction statistics
  const calculateStats = (transactions: any[]) => {
    if (transactions.length === 0) {
      return {
        total_transactions: 0,
        total_income: 0,
        total_expenses: 0,
        current_balance: 0,
        avg_transaction: 0,
        monthly_trend: { percentage: 0, isPositive: true },
        top_category: null
      };
    }

    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const total_income = income.reduce((sum, t) => sum + t.amount, 0);
    const total_expenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const current_balance = total_income - total_expenses;
    const avg_transaction = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

    // Calculate monthly trend (simplified)
    const thisMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth.getMonth() && tDate.getFullYear() === thisMonth.getFullYear();
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
    });

    const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const lastMonthTotal = lastMonthTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    const monthlyTrendPercentage = lastMonthTotal !== 0 ? 
      ((thisMonthTotal - lastMonthTotal) / Math.abs(lastMonthTotal)) * 100 : 0;

    // Find top category by total amount
    const categoryTotals = transactions.reduce((acc: any, t: any) => {
      if (t.category) {
        const key = t.category.id;
        if (!acc[key]) {
          acc[key] = {
            name: t.category.name,
            color: t.category.color,
            amount: 0
          };
        }
        acc[key].amount += t.amount;
      }
      return acc;
    }, {});

    const topCategory = Object.values(categoryTotals).reduce((max: any, current: any) => 
      current.amount > (max?.amount || 0) ? current : max, null) as { name: string; amount: number; color: string; } | null;

    return {
      total_transactions: transactions.length,
      total_income,
      total_expenses,
      current_balance,
      avg_transaction,
      monthly_trend: {
        percentage: Math.abs(monthlyTrendPercentage),
        isPositive: monthlyTrendPercentage >= 0
      },
      top_category: topCategory
    };
  };

  return (
    <div className="pt-4 pb-8 space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {/* Error Display */}
      {error && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-destructive hover:text-destructive/80 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Transaction Statistics */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
        <TransactionStats 
          stats={calculateStats(allTransactions)}
        />
      </div>

      {/* Add Transaction Button & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Add Transaction */}
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <Card variant="glass" className="h-full flex flex-col">
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="text-display text-lg font-semibold mb-2">
                Add Transaction
              </h3>
              <p className="text-body-premium text-sm mb-4">
                Record new income or expense
              </p>
              <Button 
                onClick={() => setShowTransactionForm(true)}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <TransactionFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={allTransactions.length}
            filteredCount={transactions.length}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          <BulkActions 
            selectedCount={selectedTransactions.length}
            onBulkDelete={handleBulkDelete}
            onBulkCategoryUpdate={handleBulkCategoryUpdate}
            onDeselectAll={handleDeselectAll}
          />
        </div>
      )}

      {/* Transaction List */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
        <TransactionList 
          groupedTransactions={groupTransactionsByDate(transactions)}
          selectedTransactions={selectedTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onSelect={(id: string) => {
            setSelectedTransactions(prev => 
              prev.includes(id) 
                ? prev.filter(t => t !== id)
                : [...prev, id]
            );
          }}
          onSelectAll={() => {
            if (selectedTransactions.length === transactions.length) {
              setSelectedTransactions([]);
            } else {
              setSelectedTransactions(transactions.map((t: any) => t.id));
            }
          }}
          loading={isLoading}
          hasTransactions={allTransactions.length > 0}
          hasFilteredTransactions={transactions.length > 0}
        />
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowTransactionForm(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleTransactionSubmit}
        />
      )}
    </div>
  );
}