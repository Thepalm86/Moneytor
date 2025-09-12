'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { categoryOperations, transactionOperations } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  DollarSign, 
  Tag,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Folder
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
};

interface TransactionFiltersProps {
  filters: {
    type: 'all' | 'income' | 'expense';
    category: string;
    dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
    customDateStart: string;
    customDateEnd: string;
    search: string;
    tags: string[];
    sortBy: 'date' | 'amount' | 'category' | 'created';
    sortOrder: 'asc' | 'desc';
    minAmount: string;
    maxAmount: string;
  };
  onFiltersChange: (filters: any) => void;
  totalCount: number;
  filteredCount: number;
}

export function TransactionFilters({ filters, onFiltersChange, totalCount, filteredCount }: TransactionFiltersProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadFilterData = async () => {
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
            icon: cat.icon
          }));

        setCategories(activeCategories);
        setAllTags(tagsData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    loadFilterData();
  }, [user]);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTagAdd = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      handleFilterChange('tags', [...filters.tags, tag]);
    }
    setNewTag('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleFilterChange('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: 'all',
      category: 'all',
      dateRange: 'all',
      customDateStart: '',
      customDateEnd: '',
      search: '',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc',
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = 
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.search !== '' ||
    filters.tags.length > 0 ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '';

  const availableCategories = categories.filter(cat => 
    filters.type === 'all' || cat.type === filters.type
  );

  return (
    <Card variant="glass" className="p-6 space-y-4">
      {/* Header with Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-display">Filters</h3>
            <p className="text-sm text-muted-foreground">
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} transactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                More
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 glass-card"
          />
        </div>

        {/* Type Filter */}
        <Select 
          value={filters.type} 
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                Income Only
              </div>
            </SelectItem>
            <SelectItem value="expense">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                Expense Only
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select 
          value={filters.dateRange} 
          onValueChange={(value) => handleFilterChange('dateRange', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select 
          value={`${filters.sortBy}-${filters.sortOrder}`} 
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-');
            handleFilterChange('sortBy', sortBy);
            handleFilterChange('sortOrder', sortOrder);
          }}
        >
          <SelectTrigger>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
            <SelectItem value="category-asc">Category (A-Z)</SelectItem>
            <SelectItem value="category-desc">Category (Z-A)</SelectItem>
            <SelectItem value="created-desc">Created (Newest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border/50 animate-in">
          {/* Category Filter */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Folder className="h-4 w-4" />
              Category
            </Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                      <Badge 
                        variant={category.type === 'income' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.customDateStart}
                  onChange={(e) => handleFilterChange('customDateStart', e.target.value)}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  type="date"
                  value={filters.customDateEnd}
                  onChange={(e) => handleFilterChange('customDateEnd', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Min Amount (₪)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Max Amount (₪)
              </Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            
            {/* Selected Tags */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.tags.map((tag) => (
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
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Available Tags */}
            {allTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Available tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter(tag => !filters.tags.includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs border glass-card hover:bg-primary/5"
                        onClick={() => handleTagAdd(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-border/50 animate-in">
          <div className="flex flex-wrap gap-2">
            {filters.type !== 'all' && (
              <Badge variant="outline" className="capitalize">
                Type: {filters.type}
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge variant="outline">
                Category: {availableCategories.find(cat => cat.id === filters.category)?.name || 'Unknown'}
              </Badge>
            )}
            {filters.dateRange !== 'all' && (
              <Badge variant="outline" className="capitalize">
                Date: {filters.dateRange}
              </Badge>
            )}
            {filters.search && (
              <Badge variant="outline">
                Search: &ldquo;{filters.search}&rdquo;
              </Badge>
            )}
            {(filters.minAmount || filters.maxAmount) && (
              <Badge variant="outline">
                Amount: {filters.minAmount && `₪${filters.minAmount}`} - {filters.maxAmount ? `₪${filters.maxAmount}` : '∞'}
              </Badge>
            )}
            {filters.tags.length > 0 && (
              <Badge variant="outline">
                Tags: {filters.tags.length}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}