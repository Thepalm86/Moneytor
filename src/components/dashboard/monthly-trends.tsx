'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'
import { TrendingUp, Calendar } from 'lucide-react'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

const formatCurrency = (value: number) => `₪${value.toLocaleString()}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600 capitalize">{entry.dataKey}:</span>
            <span className="text-sm font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const LoadingChart = () => (
  <Card className="p-6 bg-white/60 backdrop-blur-sm">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-80 w-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  </Card>
)

export function MonthlyTrends() {
  const { user } = useAuth()
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'area' | 'bar'>('area')

  useEffect(() => {
    if (!user) return

    const fetchMonthlyData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get data for last 6 months
        const months = []
        const now = new Date()
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          months.push({
            start: new Date(date.getFullYear(), date.getMonth(), 1),
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          })
        }

        const monthlyData: MonthlyData[] = []

        for (const month of months) {
          const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user.id)
            .gte('date', month.start.toISOString().split('T')[0])
            .lte('date', month.end.toISOString().split('T')[0])

          if (error) throw error

          const income = transactions
            ?.filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0

          const expenses = transactions
            ?.filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0) || 0

          monthlyData.push({
            month: month.label,
            income,
            expenses,
            net: income - expenses
          })
        }

        setData(monthlyData)
      } catch (err) {
        console.error('Error fetching monthly data:', err)
        setError('Failed to load monthly trends')
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [user])

  if (loading) {
    return <LoadingChart />
  }

  if (error) {
    return (
      <Card className="p-6 bg-white/60 backdrop-blur-sm">
        <div className="text-center py-8">
          <p className="text-rose-600 mb-2">Error loading monthly trends</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </Card>
    )
  }

  const totalIncome = data.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = data.reduce((sum, month) => sum + month.expenses, 0)
  const netTotal = totalIncome - totalExpenses

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Trends
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Income vs expenses over the last 6 months
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('area')}
            >
              Area
            </Button>
            <Button
              variant={viewType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('bar')}
            >
              Bar
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Total Income</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Total Expenses</p>
            <p className="text-lg font-bold text-rose-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Net Total</p>
            <p className={`text-lg font-bold ${netTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(netTotal)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'area' ? (
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No transaction data available</p>
                <p className="text-sm text-slate-400">Start adding transactions to see trends</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}