'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { achievementOperations } from '@/lib/supabase-helpers';
import { useAuth } from '@/lib/auth-context';
import { AchievementStats } from '@/components/achievements/achievement-stats';
import { AchievementFilters } from '@/components/achievements/achievement-filters';
import { AchievementList } from '@/components/achievements/achievement-list';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  points: number;
  category: 'saving' | 'spending' | 'budgeting' | 'consistency';
  criteria: any;
  isEarned: boolean;
  earnedAt: string | null;
  progress: any;
}

interface AchievementStatsType {
  totalAchievements: number;
  earnedAchievements: number;
  totalPoints: number;
  completionRate: number;
  categoryBreakdown: {
    saving: number;
    spending: number;
    budgeting: number;
    consistency: number;
  };
}

export function AchievementsTab() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        achievementOperations.fetchAll(user.id),
        achievementOperations.fetchStats(user.id)
      ]);

      setAchievements(achievementsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-in slide-in-from-top-4 duration-700">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="animate-in slide-in-from-top-4 duration-700">
        <CardHeader>
          <CardTitle className="text-display">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-premium text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-700">
      {/* Achievement Statistics */}
      {stats && <AchievementStats stats={stats} />}

      {/* Filters */}
      <AchievementFilters
        filter={filter}
        categoryFilter={categoryFilter}
        onFilterChange={setFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {/* Achievements List */}
      <AchievementList
        achievements={achievements}
        filter={filter}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}