-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Targets policies
CREATE POLICY "Users can view own targets" ON targets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own targets" ON targets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets" ON targets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own targets" ON targets
    FOR DELETE USING (auth.uid() = user_id);

-- Saving goals policies
CREATE POLICY "Users can view own saving goals" ON saving_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saving goals" ON saving_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saving goals" ON saving_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saving goals" ON saving_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view achievements" ON achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON user_achievements
    FOR DELETE USING (auth.uid() = user_id);