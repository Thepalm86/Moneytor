'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Trophy } from 'lucide-react';

interface ReportsOverviewProps {
  data?: {
    financial?: {
      totalIncome: number;
      totalExpenses: number;
      netIncome: number;
      savingsRate: number;
      transactionCount: number;
    };
    goals?: {
      totalGoals: number;
      achievedGoals: number;
      totalSaved: number;
      progressRate: number;
    };
    budgets?: {
      activeTargets: number;
      budgetUtilization: number;
      exceededTargets: number;
    };
  };
  period?: string;
}

export function ReportsOverview({ data, period = 'month' }: ReportsOverviewProps) {
  const financial = data?.financial || {
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    savingsRate: 0,
    transactionCount: 0
  };

  const goals = data?.goals || {
    totalGoals: 0,
    achievedGoals: 0,
    totalSaved: 0,
    progressRate: 0
  };

  const budgets = data?.budgets || {
    activeTargets: 0,
    budgetUtilization: 0,
    exceededTargets: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const overviewCards = [
    {
      title: 'Total Income',
      value: formatCurrency(financial.totalIncome),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: `From ${financial.transactionCount} transactions`,
      trend: financial.netIncome > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(financial.totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: `${formatPercentage((financial.totalExpenses / (financial.totalIncome || 1)) * 100)} of income`,
      trend: financial.totalExpenses > financial.totalIncome ? 'negative' : 'neutral'
    },
    {
      title: 'Net Income',
      value: formatCurrency(financial.netIncome),
      icon: BarChart3,
      color: financial.netIncome > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: financial.netIncome > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
      description: `Savings rate: ${formatPercentage(financial.savingsRate)}`,
      trend: financial.netIncome > 0 ? 'positive' : 'negative'
    },
    {
      title: 'Budget Performance',
      value: formatPercentage(budgets.budgetUtilization),
      icon: Target,
      color: budgets.budgetUtilization > 100 ? 'text-red-600' : budgets.budgetUtilization > 80 ? 'text-yellow-600' : 'text-green-600',
      bgColor: budgets.budgetUtilization > 100 ? 'bg-red-100 dark:bg-red-900/20' : budgets.budgetUtilization > 80 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-green-100 dark:bg-green-900/20',
      description: `${budgets.activeTargets} active targets`,
      trend: budgets.exceededTargets > 0 ? 'negative' : 'positive'
    },
    {
      title: 'Goals Achievement',
      value: formatPercentage(goals.totalGoals > 0 ? (goals.achievedGoals / goals.totalGoals) * 100 : 0),
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${goals.achievedGoals} of ${goals.totalGoals} completed`,
      trend: goals.achievedGoals > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Total Saved',
      value: formatCurrency(goals.totalSaved),
      icon: PieChart,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      description: `Progress: ${formatPercentage(goals.progressRate)}`,
      trend: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-display text-lg font-semibold">Financial Overview</h3>
          <p className="text-body-premium text-sm text-muted-foreground mt-1">
            Analysis for the current {period}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Period</div>
          <div className="text-display font-medium capitalize">{period}</div>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title}
              variant="glass" 
              className="p-6 h-full flex flex-col animate-in"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full border ${
                  card.trend === 'positive' 
                    ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                    : card.trend === 'negative'
                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {card.trend === 'positive' ? '↗' : card.trend === 'negative' ? '↘' : '—'}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-body-premium text-sm font-medium text-muted-foreground">
                    {card.title}
                  </h4>
                  <div className="text-display text-2xl font-bold mt-1">
                    {card.value}
                  </div>
                </div>
                
                <p className="text-body-premium text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      <Card variant="glass" className="p-6 animate-in" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <h4 className="text-display text-lg font-semibold mb-4">Quick Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-display text-xl font-bold text-primary">
              {formatPercentage(financial.savingsRate)}
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Savings Rate
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-display text-xl font-bold text-secondary">
              {financial.transactionCount}
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Transactions
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-display text-xl font-bold text-green-600">
              {budgets.activeTargets}
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Active Budgets
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-display text-xl font-bold text-yellow-600">
              {goals.totalGoals}
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Saving Goals
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}