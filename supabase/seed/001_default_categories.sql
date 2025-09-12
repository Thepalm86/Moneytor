-- Insert default achievements
INSERT INTO achievements (name, description, badge_icon, badge_color, points, criteria, category) VALUES
('First Transaction', 'Record your first transaction', 'Zap', '#3b82f6', 50, '{"transaction_count": 1}', 'consistency'),
('Saving Starter', 'Create your first saving goal', 'Target', '#10b981', 100, '{"saving_goals": 1}', 'saving'),
('Budget Master', 'Create your first budget target', 'TrendingUp', '#f59e0b', 100, '{"budget_targets": 1}', 'budgeting'),
('Consistent Tracker', 'Record transactions for 7 consecutive days', 'Calendar', '#8b5cf6', 200, '{"consecutive_days": 7}', 'consistency'),
('Big Saver', 'Save 10,000 ILS in total', 'PiggyBank', '#ef4444', 500, '{"total_saved": 10000}', 'saving'),
('Category Creator', 'Create 5 custom categories', 'Folder', '#06b6d4', 150, '{"custom_categories": 5}', 'consistency'),
('Goal Achiever', 'Complete your first saving goal', 'Award', '#f97316', 300, '{"completed_goals": 1}', 'saving'),
('Monthly Budgeter', 'Stay within budget for a full month', 'CheckCircle', '#84cc16', 400, '{"budget_months": 1}', 'budgeting'),
('Transaction Milestone', 'Record 100 transactions', 'BarChart3', '#ec4899', 250, '{"transaction_count": 100}', 'consistency'),
('Smart Spender', 'Spend less than budgeted for 3 months', 'Brain', '#6366f1', 600, '{"under_budget_months": 3}', 'budgeting');

-- Note: Default categories will be created per user via the application logic
-- This ensures proper user_id association and customization