'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Briefcase,
  PiggyBank,
  CreditCard,
  Gift,
  Plane,
  Coffee
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type CategoryWithUsage = Category & {
  transaction_count: number;
  total_amount: number;
  avg_amount: number;
  last_used: string | null;
};

interface CategoryListProps {
  categories: CategoryWithUsage[];
  onEdit: (category: CategoryWithUsage) => void;
  onDelete: (categoryId: string) => void;
  onToggle: (categoryId: string, is_active: boolean) => void;
  loading: boolean;
}

const ICON_MAP: { [key: string]: any } = {
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Briefcase,
  PiggyBank,
  CreditCard,
  Gift,
  Plane,
  Coffee,
  TrendingUp
};

export function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onToggle, 
  loading 
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getIconComponent = (iconName: string) => {
    return ICON_MAP[iconName] || Wallet;
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setDeletingId(categoryId);
      await onDelete(categoryId);
      setDeletingId(null);
    }
  };

  const getUsageIntensity = (count: number, maxCount: number) => {
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  };

  const maxUsageCount = Math.max(...categories.map(c => c.transaction_count), 1);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/60 backdrop-blur-sm border-white/20">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Wallet className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No categories found</h3>
          <p className="text-slate-600 mb-4">
            Create your first category to start organizing your transactions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => {
        const IconComponent = getIconComponent(category.icon);
        const usageIntensity = getUsageIntensity(category.transaction_count, maxUsageCount);
        
        return (
          <Card 
            key={category.id} 
            className={`p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200 ${
              !category.is_active ? 'opacity-60' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{category.name}</h3>
                    {!category.is_active && <EyeOff className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={category.type === 'income' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {category.type === 'income' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {category.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-white/20">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggle(category.id, category.is_active)}>
                    {category.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 focus:text-red-600"
                    disabled={deletingId === category.id}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deletingId === category.id ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-3">
              {/* Transaction Count */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Usage
                  </span>
                  <span className="font-medium text-slate-900">
                    {category.transaction_count} transactions
                  </span>
                </div>
                <Progress value={usageIntensity} className="h-1.5">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${usageIntensity}%`,
                      backgroundColor: category.color
                    }}
                  />
                </Progress>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Total Amount</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(category.total_amount)}
                </span>
              </div>

              {/* Average Amount */}
              {category.transaction_count > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Average</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(category.avg_amount)}
                  </span>
                </div>
              )}

              {/* Last Used */}
              {category.last_used && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last Used
                  </span>
                  <span className="text-slate-500">
                    {formatDate(category.last_used)}
                  </span>
                </div>
              )}

              {/* No Activity State */}
              {category.transaction_count === 0 && (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-400">No transactions yet</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}