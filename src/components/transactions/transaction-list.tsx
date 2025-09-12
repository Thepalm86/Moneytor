'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign,
  FileText,
  Tag,
  MoreVertical,
  Check,
  X,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface GroupedTransactions {
  [date: string]: TransactionWithCategory[];
}

interface TransactionListProps {
  groupedTransactions: GroupedTransactions;
  selectedTransactions: string[];
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (transactionId: string) => void;
  onSelect: (transactionId: string) => void;
  onSelectAll: () => void;
  loading: boolean;
  hasTransactions: boolean;
  hasFilteredTransactions: boolean;
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()}₪`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Format as weekday, month day
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

const TransactionItem = ({ 
  transaction, 
  isSelected, 
  onEdit, 
  onDelete, 
  onSelect 
}: {
  transaction: TransactionWithCategory;
  isSelected: boolean;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (transactionId: string) => void;
  onSelect: (transactionId: string) => void;
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await onDelete(transaction.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeIcon = transaction.type === 'income' ? TrendingUp : TrendingDown;
  const typeColor = transaction.type === 'income' ? 'text-success' : 'text-destructive';
  const typeIconBg = transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10';
  const Icon = typeIcon;

  return (
    <Card 
      variant="glass" 
      className={`p-4 hover-lift transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Selection Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(transaction.id)}
          className="flex-shrink-0"
        />

        {/* Category Icon */}
        <div 
          className="h-10 w-10 rounded-xl flex items-center justify-center glass-card flex-shrink-0"
          style={{ backgroundColor: `${transaction.category.color}20` }}
        >
          <div 
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: transaction.category.color }}
          />
        </div>

        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-display truncate">
              {transaction.category.name}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`p-1 rounded-lg ${typeIconBg}`}>
                <Icon className={`h-3 w-3 ${typeColor}`} />
              </div>
              <span className={`text-lg font-bold ${typeColor}`}>
                {transaction.type === 'expense' && '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Description and Tags */}
          <div className="space-y-2">
            {transaction.description && (
              <p className="text-sm text-muted-foreground/80 truncate">
                {transaction.description}
              </p>
            )}

            {transaction.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {transaction.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {transaction.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{transaction.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!showDeleteConfirm ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transaction)}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                {loading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DateGroup = ({ 
  date, 
  transactions, 
  selectedTransactions,
  onEdit, 
  onDelete, 
  onSelect 
}: {
  date: string;
  transactions: TransactionWithCategory[];
  selectedTransactions: string[];
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (transactionId: string) => void;
  onSelect: (transactionId: string) => void;
}) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-display">{formatDate(date)}</h3>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {totalIncome > 0 && (
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">{formatCurrency(totalIncome)}</span>
            </div>
          )}
          {totalExpenses > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span className="font-medium">{formatCurrency(totalExpenses)}</span>
            </div>
          )}
          {transactions.length > 1 && (
            <div className={`flex items-center gap-1 font-semibold ${
              netAmount >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              <span>=</span>
              <span>{formatCurrency(netAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            isSelected={selectedTransactions.includes(transaction.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export function TransactionList({ 
  groupedTransactions,
  selectedTransactions,
  onEdit,
  onDelete,
  onSelect,
  onSelectAll,
  loading,
  hasTransactions,
  hasFilteredTransactions
}: TransactionListProps) {
  const dateGroups = Object.entries(groupedTransactions).sort(([dateA], [dateB]) => 
    new Date(dateB).getTime() - new Date(dateA).getTime()
  );

  const allTransactionIds = Object.values(groupedTransactions)
    .flat()
    .map(t => t.id);

  const isAllSelected = allTransactionIds.length > 0 && 
    allTransactionIds.every(id => selectedTransactions.includes(id));

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 bg-muted/30 rounded-lg" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted/40 rounded" />
                <div className="h-3 w-24 bg-muted/30 rounded" />
              </div>
            </div>
            
            <div className="space-y-3">
              {[...Array(2)].map((_, itemIndex) => (
                <Card key={itemIndex} variant="glass" className="p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-4 bg-muted/30 rounded" />
                    <div className="h-10 w-10 bg-muted/30 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-muted/40 rounded" />
                      <div className="h-3 w-64 bg-muted/30 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-muted/40 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasTransactions) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/20 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-display">No Transactions Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start tracking your finances by adding your first transaction. Click the &ldquo;Add Transaction&rdquo; button above to get started.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!hasFilteredTransactions) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/20 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-display">No Matching Transactions</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No transactions match your current filters. Try adjusting your search criteria or clear all filters to see all transactions.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Select All Header */}
      {dateGroups.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="flex-shrink-0"
            />
            <span className="text-sm font-medium text-muted-foreground">
              {isAllSelected ? 'Deselect all' : 'Select all visible transactions'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedTransactions.length} of {allTransactionIds.length} selected
          </div>
        </div>
      )}

      {/* Date Groups */}
      <div className="space-y-8">
        {dateGroups.map(([date, transactions], index) => (
          <div key={date} className="animate-in" style={{ animationDelay: `${index * 100}ms` }}>
            <DateGroup
              date={date}
              transactions={transactions}
              selectedTransactions={selectedTransactions}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}