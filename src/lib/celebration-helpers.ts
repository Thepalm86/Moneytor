import { useCelebration } from '@/components/celebrations';

// Helper functions to trigger common celebrations throughout the app
export const celebrationHelpers = {
  // Financial milestones
  goalMilestone: (goalName: string, percentage: number) => ({
    type: 'milestone' as const,
    duration: 3500,
    message: `🎯 ${percentage}% milestone reached for "${goalName}"! Keep going!`,
    intensity: 'medium' as const
  }),

  goalCompleted: (goalName: string, amount: string) => ({
    type: 'fireworks' as const,
    duration: 5000,
    message: `🎉 Goal "${goalName}" completed! You saved ${amount}!`,
    intensity: 'high' as const
  }),

  budgetWarning: (targetName: string) => ({
    type: 'gentle-pop' as const,
    duration: 3000,
    message: `⚠️ Warning: "${targetName}" budget is nearing the limit!`,
    intensity: 'low' as const
  }),

  budgetExceeded: (targetName: string) => ({
    type: 'sparkles' as const,
    duration: 3500,
    message: `💰 "${targetName}" budget exceeded. Time to review spending!`,
    intensity: 'medium' as const
  }),

  // Creation celebrations
  categoryCreated: (categoryType: string, categoryName: string) => ({
    type: 'success' as const,
    duration: 3000,
    message: `New ${categoryType} category "${categoryName}" created! 📁`,
    intensity: 'medium' as const
  }),

  targetCreated: (targetName: string) => ({
    type: 'sparkles' as const,
    duration: 3000,
    message: `Budget target "${targetName}" created! Stay on track! 💪`,
    intensity: 'medium' as const
  }),

  goalCreated: (goalName: string) => ({
    type: 'milestone' as const,
    duration: 3500,
    message: `New saving goal "${goalName}" created! Time to start saving! 🎯`,
    intensity: 'medium' as const
  }),

  // Transaction celebrations
  incomeAdded: (amount: string) => ({
    type: 'success' as const,
    duration: 2500,
    message: `Income of ${amount} recorded! 💰`,
    intensity: 'low' as const
  }),

  expenseTracked: (amount: string) => ({
    type: 'gentle-pop' as const,
    duration: 2000,
    message: `Expense of ${amount} tracked! 📝`,
    intensity: 'low' as const
  }),

  // Update celebrations
  itemUpdated: (itemType: string, itemName: string) => ({
    type: 'gentle-pop' as const,
    duration: 2000,
    message: `${itemName} ${itemType} updated successfully! ✓`,
    intensity: 'low' as const
  }),

  // Achievement celebrations
  achievementUnlocked: (achievementName: string) => ({
    type: 'achievement' as const,
    duration: 4000,
    message: `Achievement Unlocked: ${achievementName}! 🏆`,
    intensity: 'high' as const
  }),

  multipleAchievements: (count: number, totalPoints: number) => ({
    type: 'fireworks' as const,
    duration: 5000,
    message: `${count} Achievements Unlocked! +${totalPoints} points! 🎊`,
    intensity: 'high' as const
  }),

  pointsEarned: (points: number) => ({
    type: 'sparkles' as const,
    duration: 2500,
    message: `+${points} points earned! ✨`,
    intensity: 'low' as const
  })
};

// Hook to easily use celebration helpers
export function useCelebrationHelpers() {
  const { triggerCelebration } = useCelebration();

  const celebrate = {
    goalMilestone: (goalName: string, percentage: number) =>
      triggerCelebration(celebrationHelpers.goalMilestone(goalName, percentage)),

    goalCompleted: (goalName: string, amount: string) =>
      triggerCelebration(celebrationHelpers.goalCompleted(goalName, amount)),

    budgetWarning: (targetName: string) =>
      triggerCelebration(celebrationHelpers.budgetWarning(targetName)),

    budgetExceeded: (targetName: string) =>
      triggerCelebration(celebrationHelpers.budgetExceeded(targetName)),

    categoryCreated: (categoryType: string, categoryName: string) =>
      triggerCelebration(celebrationHelpers.categoryCreated(categoryType, categoryName)),

    targetCreated: (targetName: string) =>
      triggerCelebration(celebrationHelpers.targetCreated(targetName)),

    goalCreated: (goalName: string) =>
      triggerCelebration(celebrationHelpers.goalCreated(goalName)),

    incomeAdded: (amount: string) =>
      triggerCelebration(celebrationHelpers.incomeAdded(amount)),

    expenseTracked: (amount: string) =>
      triggerCelebration(celebrationHelpers.expenseTracked(amount)),

    itemUpdated: (itemType: string, itemName: string) =>
      triggerCelebration(celebrationHelpers.itemUpdated(itemType, itemName)),

    achievementUnlocked: (achievementName: string) =>
      triggerCelebration(celebrationHelpers.achievementUnlocked(achievementName)),

    multipleAchievements: (count: number, totalPoints: number) =>
      triggerCelebration(celebrationHelpers.multipleAchievements(count, totalPoints)),

    pointsEarned: (points: number) =>
      triggerCelebration(celebrationHelpers.pointsEarned(points))
  };

  return celebrate;
}