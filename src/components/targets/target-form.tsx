'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { targetOperations, categoryOperations } from '@/lib/supabase-helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Target, Calendar, DollarSign, Tag } from 'lucide-react';

interface TargetFormProps {
  target?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function TargetForm({ target, onClose, onSuccess }: TargetFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    period_type: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    period_start: '',
    period_end: '',
    category_id: 'all',
  });

  // Load form data if editing
  useEffect(() => {
    if (target) {
      setFormData({
        name: target.name || '',
        target_amount: target.target_amount?.toString() || '',
        period_type: target.period_type || 'monthly',
        period_start: target.period_start || '',
        period_end: target.period_end || '',
        category_id: target.category_id || 'all',
      });
    }
  }, [target]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      if (!user) return;
      
      try {
        const categoriesData = await categoryOperations.fetchWithStats(user.id);
        // Filter only expense categories for targets
        const expenseCategories = categoriesData.filter((cat: any) => cat.type === 'expense' && cat.is_active);
        setCategories(expenseCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [user]);

  // Auto-generate period dates when period type changes
  useEffect(() => {
    if (!target) { // Only for new targets
      try {
        const periodDates = targetOperations.generatePeriodDates(formData.period_type);
        setFormData(prev => ({
          ...prev,
          period_start: periodDates.period_start,
          period_end: periodDates.period_end
        }));
      } catch (error) {
        console.error('Error generating period dates:', error);
      }
    }
  }, [formData.period_type, target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Target name is required');
      }

      if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
        throw new Error('Target amount must be greater than 0');
      }

      if (!formData.period_start || !formData.period_end) {
        throw new Error('Period dates are required');
      }

      if (new Date(formData.period_start) >= new Date(formData.period_end)) {
        throw new Error('Period start date must be before the end date');
      }

      const targetData = {
        name: formData.name.trim(),
        target_amount: parseFloat(formData.target_amount),
        period_type: formData.period_type,
        period_start: formData.period_start,
        period_end: formData.period_end,
        category_id: formData.category_id === 'all' ? null : formData.category_id,
        user_id: user.id,
      };

      if (target) {
        // Update existing target
        await targetOperations.update(target.id, user.id, targetData);
      } else {
        // Create new target
        await targetOperations.create(targetData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving target:', error);
      setError(error.message || 'Failed to save target. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span>{target ? 'Edit Target' : 'Create Budget Target'}</span>
          </DialogTitle>
          <p className="text-body-premium text-sm">
            Set spending limits and track your progress
          </p>
        </DialogHeader>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Target Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Monthly Groceries Budget"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Target Amount (₪)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Period Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Period Type
                </label>
                <Select
                  value={formData.period_type}
                  onValueChange={(value) => handleInputChange('period_type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select period type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Period Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => handleInputChange('period_start', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => handleInputChange('period_end', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Category (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category (Optional)
                </label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expenses</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center">
                          {category.icon} {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to track all expense categories
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {isLoading ? 'Saving...' : target ? 'Update Target' : 'Create Target'}
                </Button>
              </div>
            </form>
      </DialogContent>
    </Dialog>
  );
}