'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, Target, TrendingUp, Calendar } from 'lucide-react';

interface AchievementFiltersProps {
  filter: 'all' | 'earned' | 'available';
  categoryFilter: string;
  onFilterChange: (filter: 'all' | 'earned' | 'available') => void;
  onCategoryFilterChange: (category: string) => void;
}

const categoryConfig = {
  saving: { label: 'Saving', icon: Target },
  spending: { label: 'Spending', icon: TrendingUp },
  budgeting: { label: 'Budgeting', icon: Calendar },
  consistency: { label: 'Consistency', icon: Star }
};

export function AchievementFilters({ 
  filter, 
  categoryFilter, 
  onFilterChange, 
  onCategoryFilterChange 
}: AchievementFiltersProps) {
  return (
    <Card variant="glass" className="animate-in slide-in-from-top-4 duration-700 delay-300">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange('earned')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'earned' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Earned
            </button>
            <button
              onClick={() => onFilterChange('available')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'available' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Available
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryFilterChange('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                categoryFilter === 'all' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryConfig).map(([category, config]) => (
              <button
                key={category}
                onClick={() => onCategoryFilterChange(category)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === category 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}