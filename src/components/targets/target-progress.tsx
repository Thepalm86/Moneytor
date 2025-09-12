'use client';

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Target, TrendingUp, TrendingDown } from 'lucide-react'

interface TargetProgressProps {
  target: {
    id: string;
    name: string;
    target_amount: number;
    current_spending: number;
    progress_percentage: number;
    remaining_amount: number;
    days_remaining: number;
    period_type: 'weekly' | 'monthly' | 'yearly';
    period_start: string;
    period_end: string;
    status: 'on_track' | 'warning' | 'exceeded' | 'completed';
    category?: {
      id: string;
      name: string;
      color: string;
      icon: string;
    } | null;
  };
  onClick?: () => void;
}

export function TargetProgress({ target, onClick }: TargetProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = () => {
    switch (target.status) {
      case 'on_track':
        return <Badge variant="success" className="text-xs">On Track</Badge>
      case 'warning':
        return <Badge variant="warning" className="text-xs">Warning</Badge>
      case 'exceeded':
        return <Badge variant="destructive" className="text-xs">Exceeded</Badge>
      case 'completed':
        return <Badge variant="secondary" className="text-xs">Completed</Badge>
      default:
        return null
    }
  }

  const getProgressColor = () => {
    switch (target.status) {
      case 'on_track':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      case 'warning':
        return 'bg-gradient-to-r from-orange-500 to-amber-500'
      case 'exceeded':
        return 'bg-gradient-to-r from-red-500 to-rose-500'
      case 'completed':
        return 'bg-gradient-to-r from-slate-400 to-slate-500'
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-500'
    }
  }

  const dailyBudget = target.days_remaining > 0 ? target.remaining_amount / target.days_remaining : 0

  return (
    <Card 
      variant="interactive" 
      className="p-6 h-full cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {target.category ? (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: target.category.color }}
            >
              <span className="text-lg">{target.category.icon}</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-display text-lg font-semibold">{target.name}</h3>
            <p className="text-body-premium text-sm">
              {target.category ? target.category.name : 'All Expenses'} • {target.period_type}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            {formatCurrency(target.current_spending)} / {formatCurrency(target.target_amount)}
          </span>
          <span className="text-sm font-bold text-slate-800">
            {Math.round(target.progress_percentage)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, target.progress_percentage)}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {target.days_remaining}
          </p>
          <p className="text-xs text-slate-500">days</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {target.remaining_amount > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-slate-500">
              {target.remaining_amount > 0 ? 'Left' : 'Over'}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {formatCurrency(Math.abs(target.remaining_amount))}
          </p>
          {target.remaining_amount > 0 && target.days_remaining > 0 && (
            <p className="text-xs text-slate-500">
              ≈{formatCurrency(dailyBudget)}/day
            </p>
          )}
        </div>
      </div>

      {/* Period Info */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Period: {formatDate(target.period_start)} - {formatDate(target.period_end)}</span>
          {target.status === 'warning' && (
            <div className="flex items-center space-x-1 text-orange-500">
              <AlertTriangle className="w-3 h-3" />
              <span>Near limit</span>
            </div>
          )}
          {target.status === 'exceeded' && (
            <div className="flex items-center space-x-1 text-red-500">
              <AlertTriangle className="w-3 h-3" />
              <span>Over budget</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}