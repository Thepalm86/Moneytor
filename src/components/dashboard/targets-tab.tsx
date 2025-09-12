'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { targetOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TargetForm } from '@/components/targets/target-form';
import { TargetStats } from '@/components/targets/target-stats';
import { TargetList } from '@/components/targets/target-list';
import { Plus } from 'lucide-react';

interface TargetsTabProps {
  showAddTargetForm?: boolean;
  onCloseForm?: () => void;
}

export function TargetsTab({ 
  showAddTargetForm = false, 
  onCloseForm 
}: TargetsTabProps = {}) {
  const { user } = useAuth();
  const [showTargetForm, setShowTargetForm] = useState(showAddTargetForm);
  const [editingTarget, setEditingTarget] = useState(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load targets and stats
  const loadTargets = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load targets with progress
      const targetsData = await targetOperations.fetchWithProgress(user.id);
      setTargets(targetsData);
      
      // Load stats
      const statsData = await targetOperations.fetchStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading targets:', error);
      setError('Failed to load targets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, [user]);

  useEffect(() => {
    setShowTargetForm(showAddTargetForm);
  }, [showAddTargetForm]);

  const handleTargetSubmit = () => {
    setShowTargetForm(false);
    setEditingTarget(null);
    setError(null); // Clear any previous errors
    onCloseForm?.(); // Close external form if provided
    loadTargets();
  };

  const handleCloseTargetForm = () => {
    setShowTargetForm(false);
    setEditingTarget(null);
    onCloseForm?.(); // Close external form if provided
  };

  const handleEditTarget = (target: any) => {
    setEditingTarget(target);
    setShowTargetForm(true);
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await targetOperations.delete(targetId, user.id);
      loadTargets();
    } catch (error) {
      console.error('Error deleting target:', error);
      setError('Failed to delete target. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (targetId: string, currentStatus: boolean) => {
    if (!user) return;
    
    try {
      setError(null);
      await targetOperations.toggleStatus(targetId, user.id, currentStatus);
      loadTargets();
    } catch (error) {
      console.error('Error toggling target status:', error);
      setError('Failed to update target status. Please try again.');
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

      {/* Target Statistics */}
      {stats && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <TargetStats stats={stats} />
        </div>
      )}

      {/* Add Target Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <Card variant="glass" className="h-full flex flex-col">
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="text-display text-lg font-semibold mb-2">
                Create Budget Target
              </h3>
              <p className="text-body-premium text-sm mb-4">
                Set spending limits and track progress
              </p>
              <Button 
                onClick={() => setShowTargetForm(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Target
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="lg:col-span-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <Card variant="glass" className="p-6">
              <div className="text-center">
                <p className="text-body-premium text-sm font-medium">Active Targets</p>
                <p className="text-display text-3xl font-bold mt-2">
                  {stats?.active_targets || 0}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {stats?.total_targets || 0} total
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
                  across active targets
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Target List */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
        <TargetList 
          targets={targets}
          onEdit={handleEditTarget}
          onDelete={handleDeleteTarget}
          onToggleStatus={handleToggleStatus}
          loading={isLoading}
          hasTargets={targets.length > 0}
        />
      </div>

      {/* Target Form Modal */}
      {showTargetForm && (
        <TargetForm
          target={editingTarget}
          onClose={handleCloseTargetForm}
          onSuccess={handleTargetSubmit}
        />
      )}
    </div>
  );
}