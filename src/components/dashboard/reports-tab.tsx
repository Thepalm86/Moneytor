'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { analyticsOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportsOverview } from '@/components/reports/reports-overview';
import { SpendingAnalytics } from '@/components/reports/spending-analytics';
import { TrendsAnalysis } from '@/components/reports/trends-analysis';
import { ExportDialog, exportChart, ChartData, DashboardCustomizer, DashboardConfig, AdvancedAnalytics } from '@/components/charts';
import { BarChart3, PieChart, TrendingUp, RefreshCw, Download, FileText, Brain, Settings } from 'lucide-react';

type TabType = 'overview' | 'spending' | 'trends' | 'analytics';

export function ReportsTab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [spendingAnalytics, setSpendingAnalytics] = useState<any>(null);
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([]);
  const [expenseTrends, setExpenseTrends] = useState<any[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: 'grid',
    theme: 'auto',
    chartTypes: {
      overview: 'mixed',
      spending: 'pie',
      trends: 'line'
    },
    visibleSections: {
      overview: true,
      spending: true,
      trends: true,
      summary: true
    },
    colors: {
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#10B981'
    },
    animations: true,
    autoRefresh: false,
    refreshInterval: 5,
    exportFormat: 'png'
  });

  // Load all analytics data
  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Load financial summary
      const summaryData = await analyticsOperations.getFinancialSummary(user.id, 'month');
      setFinancialSummary(summaryData);
      
      // Load spending analytics
      const spendingData = await analyticsOperations.getSpendingOverview(user.id, 'month');
      setSpendingAnalytics(spendingData);
      
      // Load monthly comparison
      const monthlyData = await analyticsOperations.getMonthlyComparison(user.id, 6);
      setMonthlyComparison(monthlyData);
      
      // Load expense trends
      const trendsData = await analyticsOperations.getExpenseTrends(user.id, 'daily', 30);
      setExpenseTrends(trendsData);
      
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and user change
  useEffect(() => {
    loadAnalytics();
  }, [user]);

  // Refresh data
  const handleRefresh = () => {
    loadAnalytics();
  };

  // Enhanced export functionality
  const handleCompleteExport = async (format: 'png' | 'pdf' | 'csv' | 'json') => {
    const allData = {
      financialSummary,
      spendingAnalytics,
      monthlyComparison,
      expenseTrends
    };

    const chartData: ChartData = {
      title: 'Complete Financial Reports',
      data: Object.values(allData).flat(),
      metadata: {
        period: 'month',
        generatedAt: new Date(),
        currency: '₪'
      }
    };

    // For now, we'll export the current tab's main container
    const containerId = activeTab === 'overview' ? 'overview-container' :
                       activeTab === 'spending' ? 'spending-container' : 
                       activeTab === 'trends' ? 'trends-container' :
                       'analytics-container';

    try {
      await exportChart(containerId, chartData, {
        filename: `financial-reports-${activeTab}-${format}`,
        format
      });
    } catch (error) {
      console.error('Complete export failed:', error);
      throw error;
    }
  };

  // Dashboard customization handlers
  const handleConfigChange = (newConfig: DashboardConfig) => {
    setDashboardConfig(newConfig);
    // Apply the configuration immediately
    // This could update CSS variables or component props
  };

  const handleConfigSave = (config: DashboardConfig) => {
    // Save to localStorage or user preferences
    localStorage.setItem('dashboardConfig', JSON.stringify(config));
    console.log('Dashboard configuration saved:', config);
  };

  // Prepare advanced analytics data
  const advancedAnalyticsData = {
    transactions: monthlyComparison.flatMap(month => [
      { date: month.monthKey, amount: month.income, category: 'Income', type: 'income' as const },
      { date: month.monthKey, amount: month.expenses, category: 'Expenses', type: 'expense' as const }
    ]),
    categories: spendingAnalytics?.topCategories?.map((cat: any) => ({
      name: cat.name,
      totalAmount: cat.amount,
      avgAmount: cat.amount / (cat.count || 1),
      frequency: cat.count || 0,
      trend: Math.random() * 20 - 10 // Mock trend data
    })) || [],
    patterns: {
      dailyAverage: spendingAnalytics?.avg_transaction || 0,
      weeklyPattern: [
        { day: 'Mon', amount: Math.random() * 1000 },
        { day: 'Tue', amount: Math.random() * 1000 },
        { day: 'Wed', amount: Math.random() * 1000 },
        { day: 'Thu', amount: Math.random() * 1000 },
        { day: 'Fri', amount: Math.random() * 1000 },
        { day: 'Sat', amount: Math.random() * 1500 },
        { day: 'Sun', amount: Math.random() * 1200 }
      ],
      monthlyGrowth: Math.random() * 10 - 5,
      seasonality: []
    }
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: FileText,
      description: 'Financial summary and key metrics'
    },
    {
      id: 'spending' as TabType,
      label: 'Spending',
      icon: PieChart,
      description: 'Category breakdown and analysis'
    },
    {
      id: 'trends' as TabType,
      label: 'Trends',
      icon: TrendingUp,
      description: 'Income and expense patterns over time'
    },
    {
      id: 'analytics' as TabType,
      label: 'AI Analytics',
      icon: Brain,
      description: 'Advanced insights and predictions'
    }
  ];

  if (error) {
    return (
      <Card variant="glass" className="p-8 text-center animate-in">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-display text-lg font-semibold mb-2">Unable to Load Reports</h3>
            <p className="text-body-premium text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 h-auto py-3 px-4 justify-start"
                size="sm"
              >
                <IconComponent className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{tab.label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {tab.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <DashboardCustomizer
            config={dashboardConfig}
            onConfigChange={handleConfigChange}
            onSave={handleConfigSave}
          >
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </DashboardCustomizer>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <ExportDialog onExport={handleCompleteExport}>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in">
        {activeTab === 'overview' && (
          <div id="overview-container">
            <ReportsOverview 
              data={financialSummary} 
              period="month"
            />
          </div>
        )}
        
        {activeTab === 'spending' && (
          <div id="spending-container">
            <SpendingAnalytics 
              data={spendingAnalytics}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div id="trends-container">
            <TrendsAnalysis 
              monthlyData={monthlyComparison}
              expenseTrends={expenseTrends}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div id="analytics-container">
            <AdvancedAnalytics 
              data={advancedAnalyticsData}
              period="month"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card variant="glass" className="p-8 text-center animate-in">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-display text-lg font-semibold mb-2">Loading Analytics</h3>
              <p className="text-body-premium text-muted-foreground">
                Analyzing your financial data and generating insights...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && !financialSummary?.financial?.transactionCount && (
        <Card variant="glass" className="p-8 text-center animate-in">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-display text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-body-premium text-muted-foreground mb-4">
                Start by adding some transactions to see your financial reports and analytics.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/transactions'}>
                  Add Transactions
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/categories'}>
                  Manage Categories
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}