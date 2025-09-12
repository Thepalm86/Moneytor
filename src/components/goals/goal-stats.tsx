'use client';

import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Trophy, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface GoalStatsProps {
  stats: {
    total_goals: number;
    active_goals: number;
    achieved_goals: number;
    overdue_goals: number;
    total_target_amount: number;
    total_saved_amount: number;
    total_remaining: number;
    avg_progress: number;
    closest_to_completion?: any;
    estimated_monthly_savings: number;
    achievement_rate: number;
  };
}

export function GoalStats({ stats }: GoalStatsProps) {
  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'text-emerald-600';
      case 'on_track':
        return 'text-blue-600';
      case 'behind':
        return 'text-amber-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-indigo-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Goals */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium text-slate-600">
              Total Goals
            </p>
            <p className="text-display text-2xl font-bold mt-1">
              {stats.total_goals}
            </p>
            <div className="flex items-center mt-2 space-x-4 text-xs">
              <span className="text-emerald-600">
                {stats.achieved_goals} achieved
              </span>
              <span className="text-blue-600">
                {stats.active_goals} active
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <Target className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
      </Card>

      {/* Achievement Rate */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium text-slate-600">
              Achievement Rate
            </p>
            <p className="text-display text-2xl font-bold mt-1">
              {Math.round(stats.achievement_rate)}%
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${Math.min(100, stats.achievement_rate)}%` }}
              />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <Trophy className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </Card>

      {/* Total Saved */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium text-slate-600">
              Total Saved
            </p>
            <p className="text-display text-2xl font-bold mt-1">
              {formatCurrency(stats.total_saved_amount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of {formatCurrency(stats.total_target_amount)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>

      {/* Average Progress */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-premium text-sm font-medium text-slate-600">
              Avg Progress
            </p>
            <p className="text-display text-2xl font-bold mt-1">
              {Math.round(stats.avg_progress)}%
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.avg_progress)}`}
                style={{ width: `${Math.min(100, stats.avg_progress)}%` }}
              />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </Card>

      {/* Additional Stats Row */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monthly Savings */}
          <Card variant="glass" className="p-4">
            <div className="text-center">
              <p className="text-body-premium text-sm font-medium text-slate-600">
                Est. Monthly Savings
              </p>
              <p className="text-display text-xl font-bold mt-1">
                {formatCurrency(stats.estimated_monthly_savings)}
              </p>
            </div>
          </Card>

          {/* Remaining Amount */}
          <Card variant="glass" className="p-4">
            <div className="text-center">
              <p className="text-body-premium text-sm font-medium text-slate-600">
                Remaining to Save
              </p>
              <p className="text-display text-xl font-bold mt-1">
                {formatCurrency(stats.total_remaining)}
              </p>
            </div>
          </Card>

          {/* Goal Status Distribution */}
          <Card variant="glass" className="p-4">
            <div className="text-center">
              <p className="text-body-premium text-sm font-medium text-slate-600 mb-3">
                Goal Status
              </p>
              <div className="space-y-2">
                {stats.achieved_goals > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs">Achieved</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.achieved_goals}</span>
                  </div>
                )}
                {stats.active_goals > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Active</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.active_goals}</span>
                  </div>
                )}
                {stats.overdue_goals > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs">Overdue</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.overdue_goals}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Closest to Completion Highlight */}
      {stats.closest_to_completion && (
        <div className="md:col-span-2 lg:col-span-4">
          <Card variant="premium" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-body-premium text-sm font-medium text-slate-600">
                    Closest to Completion
                  </p>
                  <p className="text-display font-semibold">
                    {stats.closest_to_completion.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-display text-lg font-bold">
                  {Math.round(stats.closest_to_completion.progress_percentage)}%
                </p>
                <p className="text-xs text-slate-600">
                  {formatCurrency(stats.closest_to_completion.current_amount)} / 
                  {formatCurrency(stats.closest_to_completion.target_amount)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, stats.closest_to_completion.progress_percentage)}%`,
                    backgroundColor: stats.closest_to_completion.color 
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}