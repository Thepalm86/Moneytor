'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TargetProgress } from './target-progress';
import { Target, Plus } from 'lucide-react';

interface TargetListProps {
  targets: any[];
  onEdit: (target: any) => void;
  onDelete: (targetId: string) => void;
  onToggleStatus: (targetId: string, currentStatus: boolean) => void;
  loading: boolean;
  hasTargets: boolean;
}

export function TargetList({ 
  targets, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading, 
  hasTargets 
}: TargetListProps) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} variant="glass" className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded" />
              <div className="h-6 bg-slate-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!hasTargets) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-display text-lg font-semibold text-slate-600 mb-2">
          No Budget Targets Yet
        </h3>
        <p className="text-body-premium text-slate-500 mb-6">
          Create your first budget target to start tracking your spending goals.
        </p>
      </Card>
    );
  }

  if (targets.length === 0) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-display text-lg font-semibold text-slate-600 mb-2">
          No Targets Match Your Filters
        </h3>
        <p className="text-body-premium text-slate-500">
          Try adjusting your filter settings or create a new target.
        </p>
      </Card>
    );
  }

  // Group targets by status
  const activeTargets = targets.filter(target => target.is_active);
  const inactiveTargets = targets.filter(target => !target.is_active);

  return (
    <div className="space-y-6">
      {/* Active Targets */}
      {activeTargets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-semibold">
              Active Targets ({activeTargets.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeTargets.map((target) => (
              <TargetProgress
                key={target.id}
                target={target}
                onClick={() => onEdit(target)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Targets */}
      {inactiveTargets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-semibold">
              Completed Targets ({inactiveTargets.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inactiveTargets.map((target) => (
              <TargetProgress
                key={target.id}
                target={target}
                onClick={() => onEdit(target)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}