'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { savingGoalOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      } else {
        // Create new goal
        await savingGoalOperations.create({
          ...validatedData,
          user_id: user.id
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
    return isNaN(num) ? '₪0' : `₪${num.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="premium" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-display text-xl font-semibold">
              {goal ? 'Edit Saving Goal' : 'Create New Saving Goal'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Goal Name */}
          <div className="space-y-2">
            <label className="text-body-premium text-sm font-medium">
              Goal Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., New Car, Vacation, Emergency Fund"
              className="w-full"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-body-premium text-sm font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for your goal"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
            />
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Amount */}
            <div className="space-y-2">
              <label className="text-body-premium text-sm font-medium">
                Target Amount * 
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="pl-10"
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
              <label className="text-body-premium text-sm font-medium">
                Current Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number"
                  value={formData.current_amount}
                  onChange={(e) => handleInputChange('current_amount', e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="pl-10"
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
            <label className="text-body-premium text-sm font-medium">
              Target Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange('target_date', e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow
                className="pl-10"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-body-premium text-sm font-medium flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Goal Color</span>
            </label>
            <div className="grid grid-cols-9 gap-2">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.color === color
                      ? 'border-slate-900 shadow-md scale-110'
                      : 'border-slate-300 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Progress Preview */}
          {formData.target_amount && formData.current_amount && (
            <div className="space-y-2">
              <label className="text-body-premium text-sm font-medium">
                Progress Preview
              </label>
              <div className="p-4 bg-slate-100/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-slate-600">
                    {Math.min(100, Math.round((parseFloat(formData.current_amount) / parseFloat(formData.target_amount)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: formData.color,
                      width: `${Math.min(100, (parseFloat(formData.current_amount) / parseFloat(formData.target_amount)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-600">
                    {formatCurrency(formData.current_amount)}
                  </span>
                  <span className="text-xs text-slate-600">
                    {formatCurrency(formData.target_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}