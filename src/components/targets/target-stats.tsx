'use client';

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

interface TargetStatsProps {
  stats: {
    total_targets: number;
    active_targets: number;
    on_track_targets: number;
    warning_targets: number;
    exceeded_targets: number;
    total_budget: number;
    total_spent: number;
    remaining_budget: number;
    avg_progress: number;
    closest_to_limit: any;
  };
}

export function TargetStats({ stats }: TargetStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return Math.round(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Budget */}
      <Card variant="glass" className="p-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium">Total Budget</p>
            <p className="text-display text-2xl font-bold mt-2">
              {formatCurrency(stats.total_budget)}
            </p>
            <div className="flex items-center mt-2">
              <DollarSign className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-xs text-slate-600">
                {stats.active_targets} active targets
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Budget Progress */}
      <Card variant="glass" className="p-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium">Budget Used</p>
            <p className="text-display text-2xl font-bold mt-2">
              {formatPercentage(stats.avg_progress)}%
            </p>
            <div className="flex items-center mt-2">
              <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, stats.avg_progress)}%` }}
                />
              </div>
              <span className="text-xs text-slate-600">avg</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Remaining Budget */}
      <Card variant="glass" className="p-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium">Remaining</p>
            <p className="text-display text-2xl font-bold mt-2">
              {formatCurrency(stats.remaining_budget)}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-slate-600">
                From {formatCurrency(stats.total_budget)} total
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Target Status */}
      <Card variant="glass" className="p-6 h-full">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-body-premium text-sm font-medium">Target Status</p>
            <div className="flex items-center space-x-2 mt-3">
              <Badge variant="success" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.on_track_targets} On Track
              </Badge>
              {stats.warning_targets > 0 && (
                <Badge variant="warning" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.warning_targets} Warning
                </Badge>
              )}
              {stats.exceeded_targets > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.exceeded_targets} Exceeded
                </Badge>
              )}
            </div>
            {stats.closest_to_limit && (
              <p className="text-xs text-slate-500 mt-2">
                Closest to limit: {stats.closest_to_limit.name}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}