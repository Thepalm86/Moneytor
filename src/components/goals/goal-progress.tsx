'use client';

import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Calendar, DollarSign, Trophy } from 'lucide-react';

interface GoalProgressProps {
  goal: {
    id: string;
    name: string;
    description?: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    color: string;
    is_achieved: boolean;
    progress_percentage: number;
    remaining_amount: number;
    days_remaining?: number;
    status: 'on_track' | 'behind' | 'achieved' | 'overdue';
  };
  className?: string;
}

export function GoalProgress({ goal, className = '' }: GoalProgressProps) {
  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'Goal Achieved! 🎉';
      case 'on_track':
        return 'On Track';
      case 'behind':
        return 'Behind Schedule';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <Card variant="premium" className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
          <div>
            <h3 className="text-display text-xl font-bold">{goal.name}</h3>
            {goal.description && (
              <p className="text-body-premium text-sm text-slate-600 mt-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        
        {goal.is_achieved && (
          <div className="flex items-center space-x-2 text-emerald-600">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-semibold">Achieved!</span>
          </div>
        )}
      </div>

      {/* Progress Circle/Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={goal.color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - goal.progress_percentage / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round(goal.progress_percentage)}%
                </div>
                <div className="text-xs text-slate-600">Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className={`text-sm font-semibold ${getStatusColor(goal.status)}`}>
            {getStatusText(goal.status)}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="text-body-premium text-sm font-medium">Saved</span>
          </div>
          <p className="text-display text-lg font-bold">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-body-premium text-sm font-medium">Target</span>
          </div>
          <p className="text-display text-lg font-bold">
            {formatCurrency(goal.target_amount)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-body-premium text-sm font-medium">Remaining</span>
          </div>
          <p className="text-display text-lg font-bold">
            {formatCurrency(goal.remaining_amount)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-body-premium text-sm font-medium">
              {goal.days_remaining !== null ? 'Days Left' : 'No Deadline'}
            </span>
          </div>
          <p className="text-display text-lg font-bold">
            {goal.days_remaining !== null ? goal.days_remaining : 'Open'}
          </p>
        </div>
      </div>

      {/* Target Date */}
      {goal.target_date && (
        <div className="border-t border-slate-200/50 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-body-premium text-sm font-medium">Target Date:</span>
            <span className="text-display font-semibold">
              {formatDate(goal.target_date)}
            </span>
          </div>
        </div>
      )}

      {/* Achievement Message */}
      {goal.is_achieved && (
        <div className="border-t border-slate-200/50 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-emerald-800 font-semibold">
              Congratulations! You&apos;ve achieved your goal! 🎉
            </p>
            <p className="text-emerald-600 text-sm mt-1">
              You saved {formatCurrency(goal.current_amount)} out of your {formatCurrency(goal.target_amount)} target.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}