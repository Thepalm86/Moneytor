'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

interface AchievementData {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  badge_icon: string;
  badge_color: string;
}

interface AchievementNotificationProps {
  achievement: AchievementData | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  Award,
  Trophy,
  Star
};

export function AchievementNotification({ 
  achievement, 
  isOpen, 
  onClose 
}: AchievementNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 animate-celebration-bounce celebration-glow">
            <IconComponent className="h-10 w-10 text-white animate-celebration-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-gradient-luxury animate-fade-in-up">
            🎉 Achievement Unlocked! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Achievement Card */}
          <Card variant="premium" className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 animate-scale-in celebration-glow">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div 
                  className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center shadow-xl animate-celebration-sparkle"
                  style={{ backgroundColor: achievement.badge_color }}
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gradient-primary animate-fade-in-up">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {achievement.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <Badge variant="secondary" className="capitalize text-sm font-semibold px-3 py-1 animate-celebration-pop">
                    {achievement.category}
                  </Badge>
                  <Badge variant="outline" className="text-sm font-bold px-3 py-1 celebration-glow-warning animate-celebration-pop" style={{ animationDelay: '0.1s' }}>
                    +{achievement.points} points
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              asChild 
              className="flex-1"
              onClick={onClose}
            >
              <Link href="/dashboard/achievements">
                <Trophy className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Main confetti particles */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <div 
                  className={`w-3 h-3 rounded-full shadow-sm ${
                    i % 6 === 0 ? 'bg-primary' : 
                    i % 6 === 1 ? 'bg-secondary' : 
                    i % 6 === 2 ? 'bg-accent-rose' : 
                    i % 6 === 3 ? 'bg-accent-amber' : 
                    i % 6 === 4 ? 'bg-accent-emerald' : 'bg-accent-cyan'
                  }`}
                />
              </div>
            ))}
            
            {/* Sparkle effects */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute animate-celebration-sparkle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 1}s`
                }}
              >
                <div className="w-1 h-1 bg-amber-400 rounded-full shadow-lg"></div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Toast-style notification for subtle achievement alerts
interface AchievementToastProps {
  achievement: AchievementData;
  onView: () => void;
  onClose: () => void;
}

export function AchievementToast({ achievement, onView, onClose }: AchievementToastProps) {
  const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy;

  return (
    <Card 
      variant="premium" 
      className="fixed bottom-4 right-4 w-80 z-50 border-2 border-primary/30 bg-background/95 backdrop-blur-sm animate-in slide-in-from-right-full duration-300"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: achievement.badge_color }}
            >
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">Achievement Unlocked!</CardTitle>
              <p className="text-xs text-muted-foreground">{achievement.name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            +{achievement.points} points
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            className="text-xs h-7"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}