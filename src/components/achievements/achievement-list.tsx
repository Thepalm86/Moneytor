'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Target, TrendingUp, Calendar } from 'lucide-react';

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

interface AchievementListProps {
  achievements: Achievement[];
  filter: 'all' | 'earned' | 'available';
  categoryFilter: string;
}

const categoryConfig = {
  saving: { label: 'Saving', icon: Target, color: 'bg-green-500' },
  spending: { label: 'Spending', icon: TrendingUp, color: 'bg-blue-500' },
  budgeting: { label: 'Budgeting', icon: Calendar, color: 'bg-purple-500' },
  consistency: { label: 'Consistency', icon: Star, color: 'bg-orange-500' }
};

const iconMap = {
  Award,
  Trophy,
  Star,
  Target,
  TrendingUp,
  Calendar
};

export function AchievementList({ achievements, filter, categoryFilter }: AchievementListProps) {
  const filteredAchievements = achievements.filter(achievement => {
    // Status filter
    if (filter === 'earned' && !achievement.isEarned) return false;
    if (filter === 'available' && achievement.isEarned) return false;

    // Category filter
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;

    return true;
  });

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Award;
  };

  if (filteredAchievements.length === 0) {
    return (
      <Card variant="glass" className="animate-in slide-in-from-top-4 duration-700">
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-display mb-2">No achievements found</h3>
          <p className="text-body-premium text-muted-foreground">
            {filter === 'earned' 
              ? "You haven't earned any achievements yet. Keep using Moneytor to unlock them!"
              : filter === 'available'
              ? "No achievements available to earn right now."
              : "No achievements match your current filters."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAchievements.map((achievement, index) => {
        const IconComponent = getIconComponent(achievement.badge_icon);
        const categoryConfig_ = categoryConfig[achievement.category];

        return (
          <Card 
            key={achievement.id} 
            variant={achievement.isEarned ? "premium" : "glass"}
            className={`animate-in slide-in-from-bottom-4 duration-700 h-full ${achievement.isEarned ? 'ring-2 ring-primary/20' : ''}`}
            style={{ animationDelay: `${(index % 9) * 100}ms` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`p-2 rounded-lg ${categoryConfig_.color} ${achievement.isEarned ? 'opacity-100' : 'opacity-50'}`}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${achievement.isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs capitalize"
                      >
                        {achievement.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
                {achievement.isEarned && (
                  <div className="p-1 bg-primary/10 rounded-full">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-body-premium mb-4">
                {achievement.description}
              </CardDescription>

              {achievement.isEarned ? (
                <div className="text-sm text-primary font-medium">
                  ✨ Earned {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'Recently'}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  🎯 Keep going to unlock this achievement!
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}