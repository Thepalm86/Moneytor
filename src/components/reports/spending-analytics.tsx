'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, DollarSign, Filter, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { EnhancedPieChart, EnhancedBarChart, exportChart, ChartData } from '@/components/charts';

interface SpendingAnalyticsProps {
  data?: {
    period: string;
    total_spent: number;
    transaction_count: number;
    avg_transaction: number;
    categoryBreakdown: Record<string, {
      amount: number;
      count: number;
      color: string;
      percentage: number;
    }>;
    topCategories: Array<{
      name: string;
      amount: number;
      count: number;
      color: string;
      percentage: number;
    }>;
  };
  isLoading?: boolean;
}

const COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#6366F1', '#8B5A87', '#059669', '#DC2626', '#7C3AED'
];

export function SpendingAnalytics({ data, isLoading }: SpendingAnalyticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glass" className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </Card>
          <Card variant="glass" className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare enhanced chart data
  const pieChartData = data?.topCategories?.map((category, index) => ({
    name: category.name,
    value: category.amount,
    percentage: category.percentage,
    color: category.color || COLORS[index % COLORS.length],
    count: category.count
  })) || [];

  const barChartData = data?.topCategories?.map(category => ({
    name: category.name.length > 10 ? category.name.substring(0, 10) + '...' : category.name,
    fullName: category.name,
    amount: category.amount,
    count: category.count,
    color: category.color
  })) || [];

  // Export handlers
  const handlePieChartExport = async () => {
    const chartData: ChartData = {
      title: 'Category Distribution',
      data: pieChartData,
      metadata: {
        period: data?.period || period,
        generatedAt: new Date(),
        totalAmount: data?.total_spent || 0,
        currency: '₪'
      }
    };
    
    try {
      await exportChart('pie-chart-container', chartData, {
        filename: `category-distribution-${period}.png`,
        format: 'png'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleBarChartExport = async () => {
    const chartData: ChartData = {
      title: 'Top Spending Categories',
      data: barChartData,
      metadata: {
        period: data?.period || period,
        generatedAt: new Date(),
        totalAmount: data?.total_spent || 0,
        currency: '₪'
      }
    };
    
    try {
      await exportChart('bar-chart-container', chartData, {
        filename: `top-categories-${period}.png`,
        format: 'png'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle segment/bar drill-down
  const handleCategoryDrillDown = (category: any) => {
    console.log('Drill down into category:', category);
    // Could implement navigation to category-specific transactions
  };

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-display text-lg font-semibold">Spending Analytics</h3>
          <p className="text-body-premium text-sm text-muted-foreground mt-1">
            Detailed breakdown of your expenses by category
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex rounded-lg border overflow-hidden">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className="rounded-none text-xs"
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 animate-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Total Spent</div>
              <div className="text-display text-xl font-bold">{formatCurrency(data?.total_spent || 0)}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 animate-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Avg Transaction</div>
              <div className="text-display text-xl font-bold">{formatCurrency(data?.avg_transaction || 0)}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 animate-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Filter className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Categories</div>
              <div className="text-display text-xl font-bold">{data?.topCategories?.length || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Pie Chart */}
        <div id="pie-chart-container" className="animate-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <EnhancedPieChart
            data={pieChartData}
            title="Category Distribution"
            subtitle="Breakdown of expenses by category"
            onSegmentClick={handleCategoryDrillDown}
            onExport={handlePieChartExport}
          />
        </div>

        {/* Enhanced Bar Chart */}
        <div id="bar-chart-container" className="animate-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <EnhancedBarChart
            data={barChartData}
            title="Top Spending Categories"
            subtitle="Highest expense categories"
            dataKey="amount"
            onBarClick={handleCategoryDrillDown}
            onExport={handleBarChartExport}
            showTrends={false}
            interactive={true}
          />
        </div>
      </div>

      {/* Category Details Table */}
      <Card variant="glass" className="p-6 animate-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <h4 className="text-display text-base font-semibold mb-4">Category Details</h4>
        <div className="space-y-3">
          {data?.topCategories?.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between p-3 rounded-lg glass-card">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                />
                <div>
                  <div className="text-display font-medium">{category.name}</div>
                  <div className="text-body-premium text-sm text-muted-foreground">
                    {category.count} transactions
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-display font-semibold">
                  {formatCurrency(category.amount)}
                </div>
                <div className="text-body-premium text-sm text-muted-foreground">
                  {formatPercentage(category.percentage)}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-body-premium">No spending data available for this period</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}