'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { categoryOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trash2, 
  Folder, 
  Tag, 
  X, 
  Check, 
  AlertTriangle,
  Users
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
};

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkCategoryUpdate: (categoryId: string) => void;
  onDeselectAll: () => void;
}

export function BulkActions({ 
  selectedCount, 
  onBulkDelete, 
  onBulkCategoryUpdate, 
  onDeselectAll 
}: BulkActionsProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadCategories = async () => {
      try {
        const categoriesData = await categoryOperations.fetchWithStats(user.id);
        const activeCategories = categoriesData
          .filter((cat: any) => cat.is_active)
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon
          }));

        setCategories(activeCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [user]);

  const handleBulkDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await onBulkDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCategoryUpdate = async (categoryId: string) => {
    if (!categoryId) return;

    try {
      setLoading(true);
      await onBulkCategoryUpdate(categoryId);
    } catch (error) {
      console.error('Error updating transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-4 border-primary/20 bg-primary/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-display">
                {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <Badge variant="secondary" className="text-xs">
                Bulk Actions
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Perform actions on selected transactions
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Change Category */}
          <Select onValueChange={handleBulkCategoryUpdate} disabled={loading}>
            <SelectTrigger className="w-[180px] glass-card text-xs">
              <Folder className="h-3 w-3 mr-2" />
              <SelectValue placeholder="Change category..." />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                Income Categories
              </div>
              {categories
                .filter(cat => cat.type === 'income')
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-t">
                Expense Categories
              </div>
              {categories
                .filter(cat => cat.type === 'expense')
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={loading}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Confirm
                  </div>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Deselect All */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            disabled={loading}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Warning for Delete */}
      {showDeleteConfirm && (
        <div className="mt-4 pt-4 border-t border-border/50 animate-in">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">
              Are you sure you want to delete {selectedCount} transaction{selectedCount !== 1 ? 's' : ''}?
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone. All transaction data will be permanently removed.
          </p>
        </div>
      )}
    </Card>
  );
}