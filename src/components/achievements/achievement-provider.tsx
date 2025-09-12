'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AchievementNotification, AchievementToast } from './achievement-notification';
import { useCelebration } from '@/components/celebrations';

interface AchievementData {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  badge_icon: string;
  badge_color: string;
}

interface AchievementContextType {
  showAchievement: (achievement: AchievementData, style?: 'modal' | 'toast') => void;
  queueAchievements: (achievements: AchievementData[]) => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

interface AchievementProviderProps {
  children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const { triggerCelebration } = useCelebration();
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<AchievementData | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementData[]>([]);

  const showAchievement = useCallback((achievement: AchievementData, style: 'modal' | 'toast' = 'modal') => {
    if (style === 'modal') {
      setCurrentAchievement(achievement);
      setShowModal(true);
      
      // Trigger intense celebration for modal achievements
      triggerCelebration({
        type: 'achievement',
        duration: 4000,
        message: `Achievement Unlocked: ${achievement.name}!`,
        intensity: 'high'
      });
    } else {
      setToastAchievement(achievement);
      
      // Trigger subtle celebration for toast achievements
      triggerCelebration({
        type: 'sparkles',
        duration: 2500,
        message: `+${achievement.points} points earned!`,
        intensity: 'low'
      });
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setToastAchievement(null);
      }, 5000);
    }
  }, [triggerCelebration]);

  const queueAchievements = useCallback((achievements: AchievementData[]) => {
    if (achievements.length === 0) return;
    
    // Special celebration for multiple achievements
    if (achievements.length > 1) {
      const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
      triggerCelebration({
        type: 'fireworks',
        duration: 5000,
        message: `${achievements.length} Achievements Unlocked! +${totalPoints} points!`,
        intensity: 'high'
      });
    }
    
    // Show first achievement immediately
    showAchievement(achievements[0], 'modal');
    
    // Queue remaining achievements
    if (achievements.length > 1) {
      setAchievementQueue(achievements.slice(1));
    }
  }, [showAchievement, triggerCelebration]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentAchievement(null);
    
    // Show next queued achievement after a delay
    setTimeout(() => {
      if (achievementQueue.length > 0) {
        const [next, ...remaining] = achievementQueue;
        setAchievementQueue(remaining);
        showAchievement(next, 'modal');
      }
    }, 500);
  }, [achievementQueue, showAchievement]);

  const handleViewToast = useCallback(() => {
    // Navigate to achievements page
    setToastAchievement(null);
    window.location.href = '/dashboard/achievements';
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastAchievement(null);
  }, []);

  // Listen for achievement events from the engine
  useEffect(() => {
    const handleAchievementsEarned = (event: CustomEvent) => {
      const { achievements } = event.detail;
      if (achievements && achievements.length > 0) {
        // Transform the achievement data to match our interface
        const formattedAchievements = achievements.map((a: any) => ({
          id: a.achievements?.id || a.id,
          name: a.achievements?.name || a.name,
          description: a.achievements?.description || a.description,
          points: a.achievements?.points || a.points,
          category: a.achievements?.category || a.category,
          badge_icon: a.achievements?.badge_icon || a.badge_icon,
          badge_color: a.achievements?.badge_color || a.badge_color
        }));
        
        queueAchievements(formattedAchievements);
      }
    };

    window.addEventListener('achievementsEarned', handleAchievementsEarned as EventListener);
    
    return () => {
      window.removeEventListener('achievementsEarned', handleAchievementsEarned as EventListener);
    };
  }, [queueAchievements]);

  const value = {
    showAchievement,
    queueAchievements
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
      
      {/* Modal Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
      
      {/* Toast Notification */}
      {toastAchievement && (
        <AchievementToast
          achievement={toastAchievement}
          onView={handleViewToast}
          onClose={handleCloseToast}
        />
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}