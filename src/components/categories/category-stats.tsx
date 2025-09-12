'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Folder, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

interface CategoryWithUsage {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  transaction_count: number;
  total_amount: number;
  avg_amount?: number;
  last_used?: string | null;
}

interface CategoryStatsData {
  total_categories: number;
  income_categories: number;
  expense_categories: number;
  most_used_category: CategoryWithUsage | null;
  total_transactions: number;
}

interface CategoryStatsProps {
  stats: CategoryStatsData;
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  const {
    total_categories,
    income_categories,
    expense_categories,
    most_used_category,
    total_transactions
  } = stats;

  const incomePercentage = total_categories > 0 ? (income_categories / total_categories) * 100 : 0;
  const expensePercentage = total_categories > 0 ? (expense_categories / total_categories) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Categories */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Categories</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{total_categories}</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Folder className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {total_categories > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Distribution</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Income
                </span>
                <span className="font-medium">{income_categories}</span>
              </div>
              <Progress value={incomePercentage} className="h-1.5 bg-slate-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${incomePercentage}%` }}
                />
              </Progress>
              
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  Expenses
                </span>
                <span className="font-medium">{expense_categories}</span>
              </div>
              <Progress value={expensePercentage} className="h-1.5 bg-slate-200">
                <div 
                  className="h-full bg-red-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${expensePercentage}%` }}
                />
              </Progress>
            </div>
          </div>
        )}
      </Card>

      {/* Most Used Category */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Most Popular</p>
            {most_used_category ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: most_used_category.color }}
                  >
                    <div className="w-3 h-3 bg-white/80 rounded-sm"></div>
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">
                    {most_used_category.name}
                  </span>
                </div>
                <Badge 
                  variant={most_used_category.type === 'income' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {most_used_category.type}
                </Badge>
              </div>
            ) : (
              <span className="text-slate-400 text-sm">No data yet</span>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
            <Star className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {most_used_category && (
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Usage Count</span>
              <span className="font-medium">{most_used_category.transaction_count}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Amount</span>
              <span className="font-medium">{formatCurrency(most_used_category.total_amount)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Activity Overview */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Activity</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{total_transactions}</span>
              <span className="text-xs text-slate-500">transactions</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {total_categories > 0 && total_transactions > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Average per Category</span>
              <span className="font-medium">
                {Math.round(total_transactions / total_categories * 10) / 10}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((total_transactions / total_categories / 10) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Category Health */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Category Health</p>
            <div className="flex items-baseline gap-2">
              {total_categories > 0 ? (
                <>
                  <span className="text-2xl font-bold text-slate-900">
                    {Math.round((income_categories + expense_categories) / total_categories * 100)}%
                  </span>
                  <span className="text-xs text-slate-500">organized</span>
                </>
              ) : (
                <span className="text-slate-400 text-sm">No categories</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {total_categories > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-slate-600">
              <span>Coverage: </span>
              <span className="font-medium">
                {income_categories > 0 && expense_categories > 0 ? 'Complete' : 
                 income_categories > 0 ? 'Income Only' : 
                 expense_categories > 0 ? 'Expenses Only' : 'None'}
              </span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((income_categories > 0 ? 50 : 0) + (expense_categories > 0 ? 50 : 0)), 100)}%` 
                }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Income: {income_categories > 0 ? '✓' : '✗'}</span>
              <span>Expenses: {expense_categories > 0 ? '✓' : '✗'}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}