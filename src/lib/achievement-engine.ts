/**
 * Achievement Engine - Handles achievement checking and awarding
 * This system automatically checks for and awards achievements based on user actions
 */

import { achievementOperations } from './supabase-helpers';

export interface AchievementTrigger {
  userId: string;
  eventType: 'transaction_created' | 'goal_completed' | 'target_met' | 'savings_milestone' | 'consistency_check';
  eventData?: any;
}

/**
 * Main achievement engine class for processing achievement triggers
 */
export class AchievementEngine {
  /**
   * Process achievement triggers for a user action
   */
  static async processAchievements(trigger: AchievementTrigger, showNotifications = true): Promise<any[]> {
    const { userId, eventType, eventData } = trigger;
    const earnedAchievements: any[] = [];

    try {
      // Get all active achievements that might be eligible
      const allAchievements = await achievementOperations.fetchAll(userId);
      const unearned = allAchievements.filter((a: any) => !a.isEarned);

      // Check each unearned achievement for eligibility
      for (const achievement of unearned) {
        if (await this.shouldTriggerCheck(achievement, eventType)) {
          const isEligible = await achievementOperations.checkEligibility(userId, achievement.id);
          
          if (isEligible) {
            const earnedAchievement = await achievementOperations.award(
              userId, 
              achievement.id, 
              eventData
            );
            earnedAchievements.push(earnedAchievement);
          }
        }
      }

      // Trigger notifications if requested and achievements were earned
      if (showNotifications && earnedAchievements.length > 0 && typeof window !== 'undefined') {
        // Dispatch custom event for achievement notifications
        const achievementEvent = new CustomEvent('achievementsEarned', {
          detail: { achievements: earnedAchievements }
        });
        window.dispatchEvent(achievementEvent);
      }

      return earnedAchievements;
    } catch (error) {
      console.error('Error processing achievements:', error);
      return [];
    }
  }

  /**
   * Determine if an achievement should be checked for a given event type
   */
  private static async shouldTriggerCheck(achievement: any, eventType: string): Promise<boolean> {
    const { category, criteria } = achievement;

    switch (eventType) {
      case 'transaction_created':
        return category === 'spending' || category === 'consistency';
        
      case 'goal_completed':
        return category === 'saving';
        
      case 'target_met':
        return category === 'budgeting';
        
      case 'savings_milestone':
        return category === 'saving';
        
      case 'consistency_check':
        return category === 'consistency';
        
      default:
        return false;
    }
  }

  /**
   * Convenience methods for common triggers
   */
  static async onTransactionCreated(userId: string, transactionData: any) {
    return await this.processAchievements({
      userId,
      eventType: 'transaction_created',
      eventData: transactionData
    });
  }

  static async onGoalCompleted(userId: string, goalData: any) {
    return await this.processAchievements({
      userId,
      eventType: 'goal_completed',
      eventData: goalData
    });
  }

  static async onTargetMet(userId: string, targetData: any) {
    return await this.processAchievements({
      userId,
      eventType: 'target_met',
      eventData: targetData
    });
  }

  static async onSavingsMilestone(userId: string, milestoneData: any) {
    return await this.processAchievements({
      userId,
      eventType: 'savings_milestone',
      eventData: milestoneData
    });
  }

  static async checkConsistency(userId: string) {
    return await this.processAchievements({
      userId,
      eventType: 'consistency_check'
    });
  }

  /**
   * Run achievement checks for all categories (useful for periodic checks)
   */
  static async runFullCheck(userId: string) {
    const allTriggers: AchievementTrigger[] = [
      { userId, eventType: 'transaction_created' },
      { userId, eventType: 'goal_completed' },
      { userId, eventType: 'target_met' },
      { userId, eventType: 'savings_milestone' },
      { userId, eventType: 'consistency_check' }
    ];

    const results = [];
    for (const trigger of allTriggers) {
      const earned = await this.processAchievements(trigger);
      results.push(...earned);
    }

    return results;
  }
}

/**
 * Hook-style function for React components to trigger achievement checks
 */
export const useAchievementTrigger = () => {
  const triggerAchievementCheck = async (trigger: AchievementTrigger) => {
    return await AchievementEngine.processAchievements(trigger);
  };

  return { triggerAchievementCheck };
};

/**
 * Default achievement criteria templates for creating new achievements
 */
export const ACHIEVEMENT_TEMPLATES = {
  // Spending achievements
  FIRST_TRANSACTION: {
    category: 'spending',
    name: 'First Steps',
    description: 'Record your first transaction in Moneytor',
    points: 10,
    criteria: { type: 'transaction_count', count: 1 },
    badge_icon: 'Award',
    badge_color: '#10b981'
  },

  TRANSACTION_MILESTONE_10: {
    category: 'spending',
    name: 'Getting Started',
    description: 'Record 10 transactions',
    points: 25,
    criteria: { type: 'transaction_count', count: 10 },
    badge_icon: 'Trophy',
    badge_color: '#3b82f6'
  },

  TRANSACTION_MILESTONE_50: {
    category: 'spending',
    name: 'Transaction Tracker',
    description: 'Record 50 transactions',
    points: 75,
    criteria: { type: 'transaction_count', count: 50 },
    badge_icon: 'Star',
    badge_color: '#8b5cf6'
  },

  // Saving achievements  
  FIRST_GOAL: {
    category: 'saving',
    name: 'Goal Setter',
    description: 'Create your first saving goal',
    points: 20,
    criteria: { type: 'goals_created', count: 1 },
    badge_icon: 'Target',
    badge_color: '#10b981'
  },

  SAVINGS_1000: {
    category: 'saving',
    name: 'Saver',
    description: 'Save ₪1,000 across all goals',
    points: 100,
    criteria: { type: 'total_saved', target: 1000 },
    badge_icon: 'TrendingUp',
    badge_color: '#059669'
  },

  GOAL_COMPLETED: {
    category: 'saving',
    name: 'Goal Achiever',
    description: 'Complete your first saving goal',
    points: 150,
    criteria: { type: 'goals_completed', count: 1 },
    badge_icon: 'Trophy',
    badge_color: '#d97706'
  },

  // Budgeting achievements
  FIRST_TARGET: {
    category: 'budgeting',
    name: 'Budget Planner',
    description: 'Set your first budget target',
    points: 30,
    criteria: { type: 'targets_created', count: 1 },
    badge_icon: 'Calendar',
    badge_color: '#8b5cf6'
  },

  TARGET_MET: {
    category: 'budgeting',
    name: 'Budget Master',
    description: 'Stay within budget for a target',
    points: 100,
    criteria: { type: 'targets_met', count: 1 },
    badge_icon: 'Award',
    badge_color: '#7c3aed'
  },

  // Consistency achievements
  DAILY_TRACKER_7: {
    category: 'consistency',
    name: 'Week Warrior',
    description: 'Track transactions for 7 consecutive days',
    points: 50,
    criteria: { type: 'daily_transactions', days: 7 },
    badge_icon: 'Calendar',
    badge_color: '#f59e0b'
  },

  DAILY_TRACKER_30: {
    category: 'consistency',
    name: 'Monthly Master',
    description: 'Track transactions for 30 consecutive days',
    points: 200,
    criteria: { type: 'daily_transactions', days: 30 },
    badge_icon: 'Star',
    badge_color: '#dc2626'
  }
};