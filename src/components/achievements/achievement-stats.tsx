'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award } from 'lucide-react';

interface AchievementStatsProps {
  stats: {
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
  };
}

export function AchievementStats({ stats }: AchievementStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-700 delay-150">
      <Card variant="glass" className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-premium text-muted-foreground">Total Achievements</p>
              <p className="text-2xl font-bold text-foreground">{stats.earnedAchievements}/{stats.totalAchievements}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-premium text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Star className="h-5 w-5 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-premium text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Award className="h-5 w-5 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="h-full">
        <CardContent className="p-6">
          <div className="space-y-3">
            <p className="text-body-premium text-muted-foreground">Category Progress</p>
            <div className="space-y-2">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{category}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}