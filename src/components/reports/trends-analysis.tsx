'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, BarChart3, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { EnhancedLineChart, exportChart, ChartData } from '@/components/charts';

interface TrendsAnalysisProps {
  monthlyData?: Array<{
    month: string;
    monthKey: string;
    income: number;
    expenses: number;
    net: number;
    transactionCount: number;
  }>;
  expenseTrends?: Array<{
    date: string;
    displayDate: string;
    amount: number;
  }>;
  isLoading?: boolean;
}

export function TrendsAnalysis({ monthlyData = [], expenseTrends = [], isLoading }: TrendsAnalysisProps) {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card variant="glass" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₪${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₪${(amount / 1000).toFixed(0)}k`;
    }
    return `₪${amount.toFixed(0)}`;
  };

  // Calculate trends
  const latestMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const incomeChange = previousMonth ? 
    ((latestMonth?.income || 0) - previousMonth.income) / previousMonth.income * 100 : 0;
  const expenseChange = previousMonth ? 
    ((latestMonth?.expenses || 0) - previousMonth.expenses) / previousMonth.expenses * 100 : 0;
  const netChange = previousMonth ? 
    ((latestMonth?.net || 0) - previousMonth.net) / Math.abs(previousMonth.net || 1) * 100 : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border shadow-lg rounded-lg space-y-2">
          <p className="text-display font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-body-premium text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare enhanced line chart data
  const expenseLineData = expenseTrends.map(item => ({
    name: item.displayDate,
    date: item.date,
    value: item.amount
  }));

  // Export handlers
  const handleExpenseExport = async () => {
    const chartData: ChartData = {
      title: 'Daily Expense Trends',
      data: expenseLineData,
      metadata: {
        period: 'Last 30 days',
        generatedAt: new Date(),
        currency: '₪'
      }
    };
    
    try {
      await exportChart('expense-trends-container', chartData, {
        filename: 'daily-expense-trends.png',
        format: 'png'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePointClick = (point: any, index: number) => {
    console.log('Point clicked:', point, 'at index:', index);
    // Could implement detailed day view or transaction drill-down
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-display text-lg font-semibold">Financial Trends</h3>
          <p className="text-body-premium text-sm text-muted-foreground mt-1">
            Track your income and expense patterns over time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <div className="flex rounded-lg border overflow-hidden">
            {(['area', 'bar', 'line'] as const).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType(type)}
                className="rounded-none text-xs capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Income Trend</div>
              <div className="text-display text-xl font-bold text-green-600">
                {formatCurrency(latestMonth?.income || 0)}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              incomeChange > 0 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                : incomeChange < 0
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                : 'bg-muted text-muted-foreground'
            }`}>
              {incomeChange > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : incomeChange < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {Math.abs(incomeChange).toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 animate-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Expense Trend</div>
              <div className="text-display text-xl font-bold text-red-600">
                {formatCurrency(latestMonth?.expenses || 0)}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              expenseChange < 0 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                : expenseChange > 0
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                : 'bg-muted text-muted-foreground'
            }`}>
              {expenseChange > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : expenseChange < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {Math.abs(expenseChange).toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 animate-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Net Income</div>
              <div className={`text-display text-xl font-bold ${
                (latestMonth?.net || 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(latestMonth?.net || 0)}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              netChange > 0 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                : netChange < 0
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                : 'bg-muted text-muted-foreground'
            }`}>
              {netChange > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : netChange < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {Math.abs(netChange).toFixed(1)}%
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card variant="glass" className="p-6 animate-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="text-display text-base font-semibold">Monthly Income vs Expenses</h4>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Income"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3}
                  name="Expenses"
                />
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="income" 
                  fill="#10B981" 
                  radius={[2, 2, 0, 0]}
                  name="Income"
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#EF4444" 
                  radius={[2, 2, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            ) : (
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Expenses"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Enhanced Daily Expense Trends */}
      <div id="expense-trends-container" className="animate-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <EnhancedLineChart
          data={expenseLineData}
          title="Daily Expense Trends"
          subtitle="Track your daily spending patterns (Last 30 days)"
          dataKey="value"
          onPointClick={handlePointClick}
          onExport={handleExpenseExport}
          showBrush={true}
          showTrendline={true}
          className="mb-6"
        />
      </div>

      {/* Summary Statistics */}
      <Card variant="glass" className="p-6 animate-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <h4 className="text-display text-base font-semibold mb-4">Trend Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-display text-2xl font-bold text-green-600">
              {monthlyData.length > 0 ? 
                formatCompactCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length)
                : '₪0'
              }
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Avg Monthly Income
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-display text-2xl font-bold text-red-600">
              {monthlyData.length > 0 ? 
                formatCompactCurrency(monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length)
                : '₪0'
              }
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Avg Monthly Expenses
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-display text-2xl font-bold text-primary">
              {monthlyData.length > 0 ? 
                `${((monthlyData.reduce((sum, m) => sum + m.income, 0) - monthlyData.reduce((sum, m) => sum + m.expenses, 0)) / monthlyData.reduce((sum, m) => sum + m.income, 0) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Avg Savings Rate
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-display text-2xl font-bold text-secondary">
              {expenseTrends.length > 0 ?
                formatCompactCurrency(expenseTrends.reduce((sum, d) => sum + d.amount, 0) / expenseTrends.length)
                : '₪0'
              }
            </div>
            <div className="text-body-premium text-sm text-muted-foreground">
              Avg Daily Expense
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}