'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { savingGoalOperations } from '@/lib/supabase-helpers';
import { AchievementEngine } from '@/lib/achievement-engine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalForm } from '@/components/goals/goal-form';
import { GoalStats } from '@/components/goals/goal-stats';
import { GoalList } from '@/components/goals/goal-list';
import { Plus } from 'lucide-react';

export function GoalsTab() {
  const { user } = useAuth();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load goals and stats
  const loadGoals = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load goals with progress
      const goalsData = await savingGoalOperations.fetchWithProgress(user.id);
      setGoals(goalsData);
      
      // Load stats
      const statsData = await savingGoalOperations.fetchStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      setError('Failed to load saving goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  const handleGoalSubmit = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setError(null); // Clear any previous errors
    loadGoals();
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this saving goal? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      await savingGoalOperations.delete(goalId, user.id);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
    }
  };

  const handleAddFunds = async (goalId: string, amount: number) => {
    if (!user) return;
    
    try {
      setError(null);
      await savingGoalOperations.addFunds(goalId, user.id, amount);
      loadGoals();
    } catch (error) {
      console.error('Error adding funds:', error);
      setError('Failed to add funds. Please try again.');
    }
  };

  const handleWithdrawFunds = async (goalId: string, amount: number) => {
    if (!user) return;
    
    try {
      setError(null);
      await savingGoalOperations.withdrawFunds(goalId, user.id, amount);
      loadGoals();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setError('Failed to withdraw funds. Please try again.');
    }
  };

  const handleToggleAchieved = async (goalId: string, currentStatus: boolean) => {
    if (!user) return;
    
    try {
      setError(null);
      const updatedGoal = await savingGoalOperations.toggleAchieved(goalId, user.id, currentStatus);
      
      // If goal is being marked as achieved, trigger achievement check
      if (!currentStatus && updatedGoal) {
        try {
          await AchievementEngine.onGoalCompleted(user.id, updatedGoal);
        } catch (achievementError) {
          console.error('Achievement trigger failed:', achievementError);
          // Don't fail the goal update if achievement check fails
        }
      }
      
      loadGoals();
    } catch (error) {
      console.error('Error toggling achievement status:', error);
      setError('Failed to update achievement status. Please try again.');
    }
  };

  return (
    <div className="pt-4 pb-8 space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {/* Error Display */}
      {error && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-destructive hover:text-destructive/80 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Goal Statistics */}
      {stats && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <GoalStats stats={stats} />
        </div>
      )}

      {/* Add Goal Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <Card variant="glass" className="h-full flex flex-col">
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="text-display text-lg font-semibold mb-2">
                Create Saving Goal
              </h3>
              <p className="text-body-premium text-sm mb-4">
                Set targets and track your savings progress
              </p>
              <Button 
                onClick={() => setShowGoalForm(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="lg:col-span-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <Card variant="glass" className="p-6">
              <div className="text-center">
                <p className="text-body-premium text-sm font-medium">Active Goals</p>
                <p className="text-display text-3xl font-bold mt-2">
                  {stats?.active_goals || 0}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {stats?.achieved_goals || 0} achieved
                </p>
              </div>
            </Card>
            <Card variant="glass" className="p-6">
              <div className="text-center">
                <p className="text-body-premium text-sm font-medium">Avg Progress</p>
                <p className="text-display text-3xl font-bold mt-2">
                  {Math.round(stats?.avg_progress || 0)}%
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  across active goals
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Goal List */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
        <GoalList 
          goals={goals}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
          onAddFunds={handleAddFunds}
          onWithdrawFunds={handleWithdrawFunds}
          onToggleAchieved={handleToggleAchieved}
          loading={isLoading}
          hasGoals={goals.length > 0}
        />
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSuccess={handleGoalSubmit}
        />
      )}
    </div>
  );
}