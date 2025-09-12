'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { transactionOperations, categoryOperations, handleSupabaseError } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus, Tag, DollarSign, Calendar, FileText, Folder, Check } from 'lucide-react';

type TransactionWithCategory = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
  };
};

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_active: boolean;
};

interface TransactionFormProps {
  transaction?: TransactionWithCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatCurrency = (amount: number) => {
  return `₪${amount.toLocaleString()}`;
};

export function TransactionForm({ transaction, onClose, onSuccess }: TransactionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    category_id: transaction?.category_id || '',
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    tags: transaction?.tags || []
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories and tags on mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          categoryOperations.fetchWithStats(user.id),
          transactionOperations.getUniqueTags(user.id)
        ]);

        const activeCategories = categoriesData
          .filter((cat: any) => cat.is_active)
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon,
            is_active: cat.is_active
          }));

        setCategories(activeCategories);
        setAllTags(tagsData);
      } catch (error) {
        handleSupabaseError(error, 'load form data');
      }
    };

    loadData();
  }, [user]);

  // Filter categories by selected type
  const availableCategories = useMemo(() => {
    return categories.filter(category => category.type === formData.type);
  }, [categories, formData.type]);

  // Reset category when type changes
  useEffect(() => {
    if (formData.category_id && !availableCategories.find(cat => cat.id === formData.category_id)) {
      setFormData(prev => ({ ...prev, category_id: '' }));
      setErrors(prev => ({ ...prev, category_id: '' }));
    }
  }, [formData.type, availableCategories, formData.category_id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm() || loading) return;

    try {
      setLoading(true);

      const transactionData = {
        user_id: user.id,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description.trim() || null,
        date: formData.date,
        tags: formData.tags
      };

      if (transaction) {
        await transactionOperations.update(transaction.id, user.id, transactionData);
      } else {
        await transactionOperations.create(transactionData);
      }

      onSuccess();
    } catch (error) {
      handleSupabaseError(error, transaction ? 'update transaction' : 'create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    const trimmedTag = newTag.trim();
    if (!formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleQuickAddTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-display">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="flex items-center gap-2 mb-2">
                <Folder className="h-4 w-4" />
                Type
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="glass-card">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      Expense
                    </div>
                  </SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      Income
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Amount (₪)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="glass-card"
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <Label htmlFor="category" className="flex items-center gap-2 mb-2">
              <Folder className="h-4 w-4" />
              Category
            </Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className="glass-card">
                <SelectValue placeholder={`Select ${formData.type} category`} />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No {formData.type} categories available
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="glass-card"
            />
            {errors.date && (
              <p className="text-sm text-destructive mt-1">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes about this transaction..."
              rows={3}
              className="glass-card resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4" />
              Tags (Optional)
            </Label>

            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/10"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="glass-card"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Add Existing Tags */}
            {allTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick add from existing tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 8) // Show only first 8 to avoid clutter
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs border glass-card hover:bg-primary/5"
                        onClick={() => handleQuickAddTag(tag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 premium-button"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {transaction ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {transaction ? 'Update Transaction' : 'Create Transaction'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}