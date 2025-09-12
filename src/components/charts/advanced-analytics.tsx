'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  Treemap
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Zap,
  Brain,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  transactions: Array<{
    date: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
  }>;
  categories: Array<{
    name: string;
    totalAmount: number;
    avgAmount: number;
    frequency: number;
    trend: number;
  }>;
  patterns: {
    dailyAverage: number;
    weeklyPattern: Array<{ day: string; amount: number }>;
    monthlyGrowth: number;
    seasonality: Array<{ month: string; multiplier: number }>;
  };
}

interface AdvancedAnalyticsProps {
  data: AnalyticsData;
  period?: string;
  className?: string;
}

export function AdvancedAnalytics({ data, period = 'month', className = '' }: AdvancedAnalyticsProps) {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'patterns' | 'predictions'>('overview');

  // Advanced calculations
  const insights = useMemo(() => {
    const { transactions, categories } = data;
    
    // Spending velocity analysis
    const recentTransactions = transactions.slice(-30);
    const avgDailySpend = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / 30;

    // Category momentum
    const categoryMomentum = categories.map(cat => ({
      ...cat,
      momentum: cat.trend > 0 ? 'increasing' : cat.trend < 0 ? 'decreasing' : 'stable',
      efficiency: cat.totalAmount / cat.frequency, // spending efficiency
      risk: cat.trend > 20 ? 'high' : cat.trend > 10 ? 'medium' : 'low'
    }));

    // Anomaly detection
    const anomalies = transactions
      .filter(t => Math.abs(t.amount - avgDailySpend) > avgDailySpend * 2)
      .slice(0, 5);

    // Forecast next month
    const trendFactor = 1 + (data.patterns.monthlyGrowth / 100);
    const forecastedSpending = avgDailySpend * 30 * trendFactor;

    return {
      velocity: avgDailySpend,
      categoryMomentum,
      anomalies,
      forecast: forecastedSpending,
      riskScore: Math.min(100, Math.max(0, (data.patterns.monthlyGrowth + 50) / 2))
    };
  }, [data]);

  // Prepare scatter plot data for spending patterns
  const scatterData = useMemo(() => {
    return data.categories.map((cat, index) => ({
      name: cat.name,
      x: cat.frequency,
      y: cat.avgAmount,
      z: cat.totalAmount,
      trend: cat.trend,
      color: cat.trend > 10 ? '#EF4444' : cat.trend > 0 ? '#F59E0B' : '#10B981'
    }));
  }, [data.categories]);

  // Prepare treemap data for category hierarchy
  const treemapData = useMemo(() => {
    return data.categories.map(cat => ({
      name: cat.name,
      size: cat.totalAmount,
      color: insights.categoryMomentum.find(m => m.name === cat.name)?.risk === 'high' ? '#EF4444' :
             insights.categoryMomentum.find(m => m.name === cat.name)?.risk === 'medium' ? '#F59E0B' : '#10B981'
    }));
  }, [data.categories, insights.categoryMomentum]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-display text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Advanced Analytics
          </h3>
          <p className="text-body-premium text-sm text-muted-foreground mt-1">
            AI-powered insights and predictions for your financial data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {['overview', 'patterns', 'predictions'].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode as any)}
                className="rounded-none text-xs capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Spending Velocity</div>
              <div className="text-display text-lg font-bold">{formatCurrency(insights.velocity)}/day</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Next Month Forecast</div>
              <div className="text-display text-lg font-bold">{formatCurrency(insights.forecast)}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              insights.riskScore > 70 ? 'bg-red-100 dark:bg-red-900/20' :
              insights.riskScore > 40 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
              'bg-green-100 dark:bg-green-900/20'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                insights.riskScore > 70 ? 'text-red-600' :
                insights.riskScore > 40 ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Risk Score</div>
              <div className="text-display text-lg font-bold">{insights.riskScore.toFixed(0)}/100</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-body-premium text-sm text-muted-foreground">Anomalies Detected</div>
              <div className="text-display text-lg font-bold">{insights.anomalies.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dynamic Content Based on View Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Momentum Analysis */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Category Momentum
            </h4>
            <div className="space-y-3">
              {insights.categoryMomentum.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg glass-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      cat.momentum === 'increasing' ? 'bg-red-500' :
                      cat.momentum === 'decreasing' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-display font-medium">{cat.name}</span>
                    <Badge variant={cat.risk === 'high' ? 'destructive' : cat.risk === 'medium' ? 'secondary' : 'default'}>
                      {cat.risk}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-display font-semibold">{formatCurrency(cat.totalAmount)}</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      cat.trend > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {cat.trend > 0 ? '↗' : '↘'} {Math.abs(cat.trend).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Spending Pattern Scatter Plot */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4">Spending Patterns</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="x" 
                    name="Frequency"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="y" 
                    name="Avg Amount"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-card p-3 border shadow-lg rounded-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Frequency: {data.x}</p>
                            <p className="text-sm">Avg: {formatCurrency(data.y)}</p>
                            <p className="text-sm">Total: {formatCurrency(data.z)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData} fill="#8B5CF6">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {viewMode === 'patterns' && (
        <div className="space-y-6">
          {/* Weekly Pattern Analysis */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Weekly Spending Patterns
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.patterns.weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3} 
                    stroke="#8B5CF6"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Hierarchy Treemap */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4">Category Hierarchy</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                />
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {viewMode === 'predictions' && (
        <div className="space-y-6">
          {/* Anomaly Detection */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Detected Anomalies
            </h4>
            <div className="space-y-3">
              {insights.anomalies.length > 0 ? insights.anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg glass-card border-yellow-200 dark:border-yellow-800">
                  <div>
                    <div className="text-display font-medium">{anomaly.category}</div>
                    <div className="text-body-premium text-sm text-muted-foreground">
                      {new Date(anomaly.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-display font-semibold text-yellow-600">
                      {formatCurrency(anomaly.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.abs(((anomaly.amount - insights.velocity) / insights.velocity) * 100).toFixed(0)}% above avg
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-body-premium">No anomalies detected in recent data</p>
                </div>
              )}
            </div>
          </Card>

          {/* Prediction Summary */}
          <Card variant="glass" className="p-6">
            <h4 className="text-display text-base font-semibold mb-4">Financial Forecast</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-display text-2xl font-bold text-primary mb-2">
                  {formatCurrency(insights.forecast)}
                </div>
                <div className="text-body-premium text-sm text-muted-foreground">
                  Predicted Next Month Spending
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-display text-2xl font-bold text-secondary mb-2">
                  {((insights.forecast - insights.velocity * 30) / (insights.velocity * 30) * 100).toFixed(1)}%
                </div>
                <div className="text-body-premium text-sm text-muted-foreground">
                  Change vs Current Month
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-display text-2xl font-bold mb-2 ${
                  insights.riskScore > 70 ? 'text-red-600' :
                  insights.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {insights.riskScore > 70 ? 'High' : insights.riskScore > 40 ? 'Medium' : 'Low'}
                </div>
                <div className="text-body-premium text-sm text-muted-foreground">
                  Financial Risk Level
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}