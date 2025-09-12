'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Plus, 
  Minus, 
  Trophy,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface GoalListProps {
  goals: any[];
  onEdit: (goal: any) => void;
  onDelete: (goalId: string) => void;
  onAddFunds: (goalId: string, amount: number) => void;
  onWithdrawFunds: (goalId: string, amount: number) => void;
  onToggleAchieved: (goalId: string, currentStatus: boolean) => void;
  loading: boolean;
  hasGoals: boolean;
}

export function GoalList({
  goals,
  onEdit,
  onDelete,
  onAddFunds,
  onWithdrawFunds,
  onToggleAchieved,
  loading,
  hasGoals
}: GoalListProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState<string>('');
  const [fundsAction, setFundsAction] = useState<'add' | 'withdraw' | null>(null);

  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'on_track':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'behind':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'Achieved';
      case 'on_track':
        return 'On Track';
      case 'behind':
        return 'Behind Schedule';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'on_track':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'behind':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFundsSubmit = (goalId: string) => {
    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (fundsAction === 'add') {
      onAddFunds(goalId, amount);
    } else if (fundsAction === 'withdraw') {
      onWithdrawFunds(goalId, amount);
    }

    // Reset state
    setSelectedGoal(null);
    setFundsAmount('');
    setFundsAction(null);
  };

  const startFundsAction = (goalId: string, action: 'add' | 'withdraw') => {
    setSelectedGoal(goalId);
    setFundsAction(action);
    setFundsAmount('');
  };

  const cancelFundsAction = () => {
    setSelectedGoal(null);
    setFundsAmount('');
    setFundsAction(null);
  };

  if (loading) {
    return (
      <Card variant="glass" className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-body-premium text-sm mt-4">Loading your saving goals...</p>
        </div>
      </Card>
    );
  }

  if (!hasGoals) {
    return (
      <Card variant="glass" className="p-8">
        <div className="text-center">
          <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 w-fit mx-auto mb-4">
            <Target className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-display text-lg font-semibold mb-2">
            No Saving Goals Yet
          </h3>
          <p className="text-body-premium text-sm text-slate-600 mb-4">
            Start your savings journey by creating your first goal
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-display text-lg font-semibold">
          Your Saving Goals ({goals.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((goal, index) => (
          <Card 
            key={goal.id} 
            variant="glass" 
            className="p-6 h-full animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Goal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  <h4 className="text-display font-semibold text-lg truncate">
                    {goal.name}
                  </h4>
                </div>
                {goal.description && (
                  <p className="text-body-premium text-sm text-slate-600 mb-2">
                    {goal.description}
                  </p>
                )}
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                  {getStatusIcon(goal.status)}
                  <span>{getStatusText(goal.status)}</span>
                </div>
              </div>
              
              {/* Actions Menu */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(goal)}
                  className="text-slate-500 hover:text-indigo-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleAchieved(goal.id, goal.is_achieved)}
                  className={`${goal.is_achieved ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  <Trophy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(goal.id)}
                  className="text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-body-premium text-sm font-medium">
                  Progress
                </span>
                <span className="text-display text-sm font-bold">
                  {Math.round(goal.progress_percentage)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: goal.color,
                    width: `${Math.min(100, goal.progress_percentage)}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-600">
                  {formatCurrency(goal.current_amount)}
                </span>
                <span className="text-xs text-slate-600">
                  {formatCurrency(goal.target_amount)}
                </span>
              </div>
            </div>

            {/* Goal Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm">Remaining:</span>
                <span className="text-display font-semibold">
                  {formatCurrency(goal.remaining_amount)}
                </span>
              </div>
              
              {goal.target_date && (
                <div className="flex justify-between items-center">
                  <span className="text-body-premium text-sm flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Target Date:</span>
                  </span>
                  <span className="text-display font-medium">
                    {formatDate(goal.target_date)}
                  </span>
                </div>
              )}
              
              {goal.days_remaining !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-body-premium text-sm">Days Remaining:</span>
                  <span className={`text-display font-semibold ${
                    goal.days_remaining < 30 ? 'text-red-600' : 
                    goal.days_remaining < 90 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {goal.days_remaining}
                  </span>
                </div>
              )}
            </div>

            {/* Funds Management */}
            {selectedGoal === goal.id && fundsAction ? (
              <div className="border-t border-slate-200/50 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-body-premium text-sm font-medium">
                      {fundsAction === 'add' ? 'Add Funds' : 'Withdraw Funds'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={fundsAmount}
                      onChange={(e) => setFundsAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleFundsSubmit(goal.id)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      disabled={!fundsAmount || parseFloat(fundsAmount) <= 0}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelFundsAction}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-200/50 pt-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startFundsAction(goal.id, 'add')}
                    className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    disabled={goal.is_achieved}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Funds
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startFundsAction(goal.id, 'withdraw')}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={goal.current_amount <= 0}
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Withdraw
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}