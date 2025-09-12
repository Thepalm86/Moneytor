'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface CategoryFilters {
  type: 'all' | 'income' | 'expense';
  status: 'all' | 'active' | 'inactive';
  search: string;
  sortBy: 'name' | 'usage' | 'amount' | 'recent';
  sortOrder: 'asc' | 'desc';
}

interface CategoryFiltersProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export function CategoryFilters({ 
  filters, 
  onFiltersChange, 
  totalCount, 
  filteredCount 
}: CategoryFiltersProps) {
  const handleFilterChange = (key: keyof CategoryFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      type: 'all',
      status: 'all',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const isFiltered = filters.type !== 'all' || 
                    filters.status !== 'all' || 
                    filters.search !== '' ||
                    filters.sortBy !== 'name' ||
                    filters.sortOrder !== 'asc';

  return (
    <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9 bg-white/50 border-white/20 focus:bg-white/70"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Type:</span>
          <Select 
            value={filters.type} 
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="w-32 bg-white/50 border-white/20 focus:bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Income
                </div>
              </SelectItem>
              <SelectItem value="expense">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Expense
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Status:</span>
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-32 bg-white/50 border-white/20 focus:bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-gray-500" />
                  Inactive
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Sort:</span>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-32 bg-white/50 border-white/20 focus:bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/50 border-white/20 hover:bg-white/70"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2 bg-white/50 border-white/20 hover:bg-white/70"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>
            Showing {filteredCount} of {totalCount} categories
          </span>
        </div>

        {/* Active Filters */}
        {isFiltered && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.type !== 'all' && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/70"
              >
                {filters.type}
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/70"
              >
                {filters.status}
              </Badge>
            )}
            {filters.search && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/70"
              >
                &quot;{filters.search}&quot;
              </Badge>
            )}
            {(filters.sortBy !== 'name' || filters.sortOrder !== 'asc') && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/70"
              >
                {filters.sortBy} {filters.sortOrder}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}