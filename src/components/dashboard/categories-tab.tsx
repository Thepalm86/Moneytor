'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { categoryOperations, handleSupabaseError } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryForm } from '@/components/categories/category-form';
import { CategoryStats } from '@/components/categories/category-stats';
import { CategoryList } from '@/components/categories/category-list';
import { CategoryFilters } from '@/components/categories/category-filters';
import { Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react';

type CategoryWithUsage = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  transaction_count: number;
  total_amount: number;
  avg_amount: number;
  last_used: string | null;
};

interface CategoryStats {
  total_categories: number;
  income_categories: number;
  expense_categories: number;
  most_used_category: CategoryWithUsage | null;
  total_transactions: number;
}

export function CategoriesTab() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithUsage[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithUsage | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    status: 'all' as 'all' | 'active' | 'inactive',
    search: '',
    sortBy: 'name' as 'name' | 'usage' | 'amount' | 'recent',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const categoriesWithUsage = await categoryOperations.fetchWithStats(user.id);
      setCategories(categoriesWithUsage as CategoryWithUsage[]);
    } catch (error) {
      handleSupabaseError(error, 'fetch categories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const statsData = await categoryOperations.fetchForStats(user.id);
      setStats(statsData);
    } catch (error) {
      handleSupabaseError(error, 'fetch category statistics');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchStats();
    }
  }, [user, fetchCategories, fetchStats]);

  const handleCategoryCreated = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchCategories();
    fetchStats();
  };

  const handleCategoryEdit = (category: CategoryWithUsage) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (!user) return;
    
    try {
      await categoryOperations.delete(categoryId, user.id);
      fetchCategories();
      fetchStats();
    } catch (error) {
      handleSupabaseError(error, 'delete category');
    }
  };

  const handleCategoryToggle = async (categoryId: string, is_active: boolean) => {
    if (!user) return;
    
    try {
      await categoryOperations.toggleStatus(categoryId, user.id, is_active);
      fetchCategories();
    } catch (error) {
      handleSupabaseError(error, 'toggle category status');
    }
  };

  const filteredCategories = categories.filter(category => {
    if (filters.type !== 'all' && category.type !== filters.type) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'active' && !category.is_active) return false;
      if (filters.status === 'inactive' && category.is_active) return false;
    }
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'name':
        return order * a.name.localeCompare(b.name);
      case 'usage':
        return order * (a.transaction_count - b.transaction_count);
      case 'amount':
        return order * (a.total_amount - b.total_amount);
      case 'recent':
        const aDate = a.last_used ? new Date(a.last_used).getTime() : 0;
        const bDate = b.last_used ? new Date(b.last_used).getTime() : 0;
        return order * (aDate - bDate);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setShowForm(true)} 
          variant="default"
          className="shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && <CategoryStats stats={stats} />}

      {/* Filters */}
      <CategoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={categories.length}
        filteredCount={filteredCategories.length}
      />

      {/* Categories List */}
      <CategoryList
        categories={filteredCategories}
        onEdit={handleCategoryEdit}
        onDelete={handleCategoryDelete}
        onToggle={handleCategoryToggle}
        loading={loading}
      />

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSuccess={handleCategoryCreated}
        />
      )}
    </div>
  );
}