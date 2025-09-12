'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { savingGoalOperations } from '@/lib/supabase-helpers';
import { useCelebration } from '@/components/celebrations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Target, Calendar, Palette, DollarSign } from 'lucide-react';

const GOAL_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#64748b'  // slate-500
];

interface GoalFormProps {
  goal?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoalForm({ goal, onClose, onSuccess }: GoalFormProps) {
  const { user } = useAuth();
  const { triggerCelebration } = useCelebration();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    color: '#6366f1' // Default to indigo
  });

  // Initialize form data when goal prop changes
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        target_amount: goal.target_amount?.toString() || '',
        current_amount: goal.current_amount?.toString() || '',
        target_date: goal.target_date || '',
        color: goal.color || '#6366f1'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        color: '#6366f1'
      });
    }
    setError(null);
  }, [goal]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Goal name is required');
    }

    const targetAmount = parseFloat(formData.target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      throw new Error('Target amount must be a positive number');
    }

    const currentAmount = parseFloat(formData.current_amount || '0');
    if (isNaN(currentAmount) || currentAmount < 0) {
      throw new Error('Current amount cannot be negative');
    }

    if (formData.target_date && new Date(formData.target_date) <= new Date()) {
      throw new Error('Target date must be in the future');
    }

    return {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: formData.target_date || null,
      color: formData.color
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const validatedData = validateForm();
      
      if (goal) {
        // Update existing goal
        await savingGoalOperations.update(goal.id, user.id, validatedData);
        
        // Trigger subtle celebration for updates
        triggerCelebration({
          type: 'gentle-pop',
          duration: 2000,
          message: `${validatedData.name} updated successfully!`
        });
      } else {
        // Create new goal
        await savingGoalOperations.create({
          ...validatedData,
          user_id: user.id
        });
        
        // Trigger celebration for new goal creation
        triggerCelebration({
          type: 'milestone',
          duration: 3500,
          message: `New saving goal "${validatedData.name}" created! Time to start saving! 🎯`,
          intensity: 'medium'
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      setError(error.message || 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0₪' : `${num.toLocaleString()}₪`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-emerald-50 to-teal-50/20 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader className="border-b border-emerald-200/20 bg-gradient-to-r from-transparent to-emerald-50/20">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            {goal ? 'Edit Saving Goal' : 'Create New Saving Goal'}
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-1">
            Set your financial targets and track your progress
          </p>
        </DialogHeader>

        <DialogBody>
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Goal Name *
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., New Car, Vacation, Emergency Fund"
                className="w-full bg-white/70 border-slate-200/50 hover:bg-white/80 transition-colors shadow-sm"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description for your goal"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-slate-200/50 bg-white/70 hover:bg-white/80 transition-colors shadow-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent resize-none"
              />
            </div>

            {/* Amount Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Amount */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Target Amount * 
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => handleInputChange('target_amount', e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="pl-10 bg-white/70 border-slate-200/50 hover:bg-white/80 transition-colors shadow-sm"
                    required
                  />
                </div>
                {formData.target_amount && (
                  <p className="text-xs text-slate-600">
                    Target: {formatCurrency(formData.target_amount)}
                  </p>
                )}
              </div>

              {/* Current Amount */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Current Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="number"
                    value={formData.current_amount}
                    onChange={(e) => handleInputChange('current_amount', e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="pl-10 bg-white/70 border-slate-200/50 hover:bg-white/80 transition-colors shadow-sm"
                  />
                </div>
                {formData.current_amount && (
                  <p className="text-xs text-slate-600">
                    Saved: {formatCurrency(formData.current_amount)}
                  </p>
                )}
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Target Date (Optional)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => handleInputChange('target_date', e.target.value)}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="pl-10 bg-white/70 border-slate-200/50 hover:bg-white/80 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Goal Color</span>
              </Label>
              <div className="grid grid-cols-9 gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 shadow-lg ${
                      formData.color === color
                        ? 'border-slate-800 ring-2 ring-slate-300 scale-110'
                        : 'border-white hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Preview */}
            {formData.target_amount && formData.current_amount && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Progress Preview
                </Label>
                <div className="p-4 bg-gradient-to-r from-white/70 to-emerald-50/50 rounded-lg border border-emerald-200/50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-slate-600">
                      {Math.min(100, Math.round((parseFloat(formData.current_amount) / parseFloat(formData.target_amount)) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                    <div
                      className="h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        backgroundColor: formData.color,
                        width: `${Math.min(100, (parseFloat(formData.current_amount) / parseFloat(formData.target_amount)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-600 font-medium">
                      {formatCurrency(formData.current_amount)}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {formatCurrency(formData.target_amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </DialogBody>

        <DialogFooter className="bg-gradient-to-r from-transparent to-emerald-50/20">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white/70 hover:bg-white/80 border-slate-200/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
          >
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}