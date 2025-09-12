-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate spending for a budget target
CREATE OR REPLACE FUNCTION get_target_spending(target_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    spending DECIMAL := 0;
    target_record targets%ROWTYPE;
BEGIN
    SELECT * INTO target_record FROM targets WHERE id = target_id;
    
    IF target_record.category_id IS NOT NULL THEN
        -- Category-specific target
        SELECT COALESCE(SUM(amount), 0) INTO spending
        FROM transactions
        WHERE user_id = target_record.user_id
          AND category_id = target_record.category_id
          AND type = 'expense'
          AND date >= target_record.period_start
          AND date <= target_record.period_end;
    ELSE
        -- Overall spending target
        SELECT COALESCE(SUM(amount), 0) INTO spending
        FROM transactions
        WHERE user_id = target_record.user_id
          AND type = 'expense'
          AND date >= target_record.period_start
          AND date <= target_record.period_end;
    END IF;
    
    RETURN spending;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total income for a period
CREATE OR REPLACE FUNCTION get_period_income(user_id UUID, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    total_income DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM transactions
    WHERE transactions.user_id = get_period_income.user_id
      AND type = 'income'
      AND date >= start_date
      AND date <= end_date;
    
    RETURN total_income;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total expenses for a period
CREATE OR REPLACE FUNCTION get_period_expenses(user_id UUID, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    total_expenses DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM transactions
    WHERE transactions.user_id = get_period_expenses.user_id
      AND type = 'expense'
      AND date >= start_date
      AND date <= end_date;
    
    RETURN total_expenses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get spending by category for a period
CREATE OR REPLACE FUNCTION get_category_spending(user_id UUID, category_id UUID, start_date DATE, end_date DATE)
RETURNS DECIMAL AS $$
DECLARE
    category_total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO category_total
    FROM transactions
    WHERE transactions.user_id = get_category_spending.user_id
      AND transactions.category_id = get_category_spending.category_id
      AND type = 'expense'
      AND date >= start_date
      AND date <= end_date;
    
    RETURN category_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update saving goal progress
CREATE OR REPLACE FUNCTION update_saving_goal_progress(goal_id UUID, amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    goal_record saving_goals%ROWTYPE;
BEGIN
    SELECT * INTO goal_record FROM saving_goals WHERE id = goal_id;
    
    IF goal_record.id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    UPDATE saving_goals 
    SET 
        current_amount = current_amount + amount,
        is_achieved = (current_amount + amount) >= target_amount,
        updated_at = NOW()
    WHERE id = goal_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;