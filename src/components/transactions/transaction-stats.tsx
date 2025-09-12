'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3
} from 'lucide-react';

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

interface TransactionStatsProps {
  stats: TransactionStats;
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()}₪`;
};

const TrendIndicator = ({ trend }: { trend: { percentage: number; isPositive: boolean } }) => {
  const Icon = trend.isPositive ? TrendingUp : TrendingDown;
  const colorClass = trend.isPositive ? 'text-success' : 'text-destructive';
  const bgClass = trend.isPositive ? 'bg-success/10' : 'bg-destructive/10';
  const sign = trend.isPositive ? '+' : '';

  return (
    <div className="flex items-center gap-2 animate-in">
      <div className={`p-1 rounded-lg glass-card ${bgClass}`}>
        <Icon className={`h-3 w-3 ${colorClass}`} />
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-semibold ${colorClass}`}>
          {sign}{Math.abs(trend.percentage).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground/70">this month</span>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  badge,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  className = ""
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { percentage: number; isPositive: boolean };
  badge?: { text: string; variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}) => {
  return (
    <Card 
      variant="premium" 
      className={`p-6 hover-lift hover-glow group relative overflow-hidden h-full flex flex-col ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground/80 tracking-wide uppercase mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-display text-foreground leading-tight">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${iconBgColor} flex items-center justify-center glass-card group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        <div className="flex flex-col justify-end flex-1 space-y-3">
          {badge && (
            <Badge 
              variant={badge.variant || 'secondary'} 
              className="text-xs font-medium px-3 py-1 rounded-full w-fit"
            >
              {badge.text}
            </Badge>
          )}

          {trend && <TrendIndicator trend={trend} />}
        </div>
      </div>
    </Card>
  );
};

export function TransactionStats({ stats }: TransactionStatsProps) {
  const balanceColor = stats.current_balance >= 0 ? 'text-success' : 'text-destructive';
  const balanceIcon = stats.current_balance >= 0 ? 'bg-success/10' : 'bg-destructive/10';
  const balanceIconColor = stats.current_balance >= 0 ? 'text-success' : 'text-destructive';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Transactions */}
      <div className="animate-in" style={{ animationDelay: '100ms' }}>
        <StatCard
          title="Total Transactions"
          value={stats.total_transactions}
          icon={Receipt}
          trend={stats.monthly_trend}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
      </div>

      {/* Current Balance */}
      <div className="animate-in" style={{ animationDelay: '200ms' }}>
        <StatCard
          title="Current Balance"
          value={stats.current_balance}
          icon={DollarSign}
          badge={{
            text: stats.current_balance >= 0 ? 'Positive' : 'Negative',
            variant: stats.current_balance >= 0 ? 'success' : 'destructive'
          }}
          iconBgColor={balanceIcon}
          iconColor={balanceIconColor}
        />
      </div>

      {/* Total Income */}
      <div className="animate-in" style={{ animationDelay: '300ms' }}>
        <StatCard
          title="Total Income"
          value={stats.total_income}
          icon={ArrowUpRight}
          iconBgColor="bg-success/10"
          iconColor="text-success"
        />
      </div>

      {/* Total Expenses */}
      <div className="animate-in" style={{ animationDelay: '400ms' }}>
        <StatCard
          title="Total Expenses"
          value={stats.total_expenses}
          icon={ArrowDownRight}
          iconBgColor="bg-destructive/10"
          iconColor="text-destructive"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="md:col-span-2 lg:col-span-2 animate-in" style={{ animationDelay: '500ms' }}>
        <Card 
          variant="glass" 
          className="p-6 hover-lift group relative overflow-hidden h-full"
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center glass-card">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-display">Average Transaction</h3>
                <p className="text-sm text-muted-foreground/70">Per transaction amount</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-3xl font-bold text-display">
                {formatCurrency(stats.avg_transaction)}
              </p>
              
              {stats.top_category && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 glass-card">
                  <div 
                    className="h-4 w-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: stats.top_category.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Top Category</p>
                    <p className="text-xs text-muted-foreground">{stats.top_category.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(stats.top_category.amount)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <div className="md:col-span-2 lg:col-span-2 animate-in" style={{ animationDelay: '600ms' }}>
        <Card 
          variant="glass" 
          className="p-6 hover-lift group relative overflow-hidden h-full"
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glass-card">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-display">Financial Overview</h3>
                <p className="text-sm text-muted-foreground/70">Key metrics at a glance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xl font-bold text-success">
                  {stats.total_income > 0 ? `${stats.total_income.toLocaleString()}₪` : '0₪'}
                </p>
                <p className="text-xs text-success/80 font-medium">Income</p>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-xl font-bold text-destructive">
                  {stats.total_expenses > 0 ? `${stats.total_expenses.toLocaleString()}₪` : '0₪'}
                </p>
                <p className="text-xs text-destructive/80 font-medium">Expenses</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Net Balance</span>
                <span className={`text-lg font-bold ${balanceColor}`}>
                  {formatCurrency(stats.current_balance)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}