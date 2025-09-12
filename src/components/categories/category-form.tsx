'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { categoryOperations, handleSupabaseError } from '@/lib/supabase-helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
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
  TrendingUp,
  Check,
  X
} from 'lucide-react';

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

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_COLORS = [
  { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Sky', value: '#0ea5e9', bg: 'bg-sky-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Green', value: '#22c55e', bg: 'bg-green-500' },
  { name: 'Lime', value: '#84cc16', bg: 'bg-lime-500' },
  { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Gray', value: '#6b7280', bg: 'bg-gray-500' },
  { name: 'Slate', value: '#64748b', bg: 'bg-slate-500' }
];

const CATEGORY_ICONS = [
  { name: 'Wallet', icon: Wallet, value: 'Wallet' },
  { name: 'Shopping Cart', icon: ShoppingCart, value: 'ShoppingCart' },
  { name: 'Home', icon: Home, value: 'Home' },
  { name: 'Car', icon: Car, value: 'Car' },
  { name: 'Utensils', icon: Utensils, value: 'Utensils' },
  { name: 'Gamepad', icon: Gamepad2, value: 'Gamepad2' },
  { name: 'Heart', icon: Heart, value: 'Heart' },
  { name: 'Education', icon: GraduationCap, value: 'GraduationCap' },
  { name: 'Briefcase', icon: Briefcase, value: 'Briefcase' },
  { name: 'Piggy Bank', icon: PiggyBank, value: 'PiggyBank' },
  { name: 'Credit Card', icon: CreditCard, value: 'CreditCard' },
  { name: 'Gift', icon: Gift, value: 'Gift' },
  { name: 'Plane', icon: Plane, value: 'Plane' },
  { name: 'Coffee', icon: Coffee, value: 'Coffee' },
  { name: 'Trending Up', icon: TrendingUp, value: 'TrendingUp' }
];

export function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#a855f7',
    icon: 'Wallet',
    is_active: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        is_active: category.is_active
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;

    try {
      setLoading(true);

      if (category) {
        // Update existing category
        await categoryOperations.update(category.id, user.id, {
          name: formData.name.trim(),
          type: formData.type,
          color: formData.color,
          icon: formData.icon,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new category
        await categoryOperations.create({
          user_id: user.id,
          name: formData.name.trim(),
          type: formData.type,
          color: formData.color,
          icon: formData.icon,
          is_active: formData.is_active
        });
      }

      onSuccess();
    } catch (error) {
      handleSupabaseError(error, 'save category');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = CATEGORY_ICONS.find(icon => icon.value === iconName);
    return iconData ? iconData.icon : Wallet;
  };

  const IconComponent = getIconComponent(formData.icon);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {category ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name..."
              required
              className="bg-white/50 border-white/20 focus:bg-white/70"
            />
          </div>

          {/* Category Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Category Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense') => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-white/50 border-white/20 focus:bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20">
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Expense
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Income
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Category Color</Label>
            <div className="grid grid-cols-9 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full ${color.bg} hover:scale-110 transition-transform relative`}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label>Category Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_ICONS.map((iconData) => {
                const Icon = iconData.icon;
                return (
                  <button
                    key={iconData.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconData.value })}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      formData.icon === iconData.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300'
                    }`}
                    title={iconData.name}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-white/20">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">{formData.name || 'Category Name'}</div>
                <Badge variant={formData.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                  {formData.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}