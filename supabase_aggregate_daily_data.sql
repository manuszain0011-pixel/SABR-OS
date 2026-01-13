-- =====================================================
-- SABR OS - Auto-populate Daily Activity Summary
-- This script aggregates existing data to populate daily_activity_summary
-- Run this AFTER the main schema is created
-- =====================================================

-- Function to aggregate daily data for a specific user and date
CREATE OR REPLACE FUNCTION aggregate_daily_data(
    p_user_id UUID,
    p_date DATE
) RETURNS void AS $$
DECLARE
    v_prayers_completed INTEGER := 0;
    v_quran_pages INTEGER := 0;
    v_quran_minutes INTEGER := 0;
    v_dhikr_count INTEGER := 0;
    v_tasks_completed INTEGER := 0;
    v_tasks_total INTEGER := 0;
    v_habits_completed INTEGER := 0;
    v_habits_total INTEGER := 0;
    v_income DECIMAL(10,2) := 0;
    v_expense DECIMAL(10,2) := 0;
    v_transactions_count INTEGER := 0;
    v_notes_created INTEGER := 0;
    v_ideas_captured INTEGER := 0;
BEGIN
    -- Count prayers completed
    SELECT 
        COALESCE(
            (CASE WHEN fajr IS NOT NULL AND fajr != 'pending' AND fajr != 'missed' THEN 1 ELSE 0 END) +
            (CASE WHEN dhuhr IS NOT NULL AND dhuhr != 'pending' AND dhuhr != 'missed' THEN 1 ELSE 0 END) +
            (CASE WHEN asr IS NOT NULL AND asr != 'pending' AND asr != 'missed' THEN 1 ELSE 0 END) +
            (CASE WHEN maghrib IS NOT NULL AND maghrib != 'pending' AND maghrib != 'missed' THEN 1 ELSE 0 END) +
            (CASE WHEN isha IS NOT NULL AND isha != 'pending' AND isha != 'missed' THEN 1 ELSE 0 END),
            0
        )
    INTO v_prayers_completed
    FROM prayer_records
    WHERE user_id = p_user_id AND date = p_date;

    -- Count Quran progress
    SELECT 
        COALESCE(SUM(pages_read), 0),
        COALESCE(SUM(duration_minutes), 0)
    INTO v_quran_pages, v_quran_minutes
    FROM quran_progress
    WHERE user_id = p_user_id AND date = p_date;

    -- Count Dhikr
    SELECT COALESCE(SUM(count), 0)
    INTO v_dhikr_count
    FROM zikr_entries
    WHERE user_id = p_user_id AND DATE(created_at) = p_date;

    -- Count tasks
    SELECT 
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*)
    INTO v_tasks_completed, v_tasks_total
    FROM tasks
    WHERE user_id = p_user_id AND due_date = p_date;

    -- Count habits (active habits on that date)
    SELECT COUNT(*)
    INTO v_habits_total
    FROM habits
    WHERE user_id = p_user_id 
      AND is_active = true
      AND created_at::date <= p_date;

    -- Count habit completions
    SELECT COUNT(*)
    INTO v_habits_completed
    FROM habit_completions
    WHERE user_id = p_user_id AND DATE(created_at) = p_date;

    -- Finance data
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        COUNT(*)
    INTO v_income, v_expense, v_transactions_count
    FROM finance_transactions
    WHERE user_id = p_user_id AND date = p_date;

    -- Count notes created
    SELECT COUNT(*)
    INTO v_notes_created
    FROM notes
    WHERE user_id = p_user_id AND DATE(created_at) = p_date;

    -- Count ideas captured
    SELECT COUNT(*)
    INTO v_ideas_captured
    FROM ideas
    WHERE user_id = p_user_id AND DATE(created_at) = p_date;

    -- Insert or update the summary
    INSERT INTO daily_activity_summary (
        user_id,
        date,
        prayers_completed,
        prayers_total,
        quran_pages_read,
        quran_minutes,
        dhikr_count,
        tasks_completed,
        tasks_total,
        habits_completed,
        habits_total,
        income_amount,
        expense_amount,
        transactions_count,
        notes_created,
        ideas_captured
    ) VALUES (
        p_user_id,
        p_date,
        v_prayers_completed,
        5, -- prayers_total is always 5
        v_quran_pages,
        v_quran_minutes,
        v_dhikr_count,
        v_tasks_completed,
        v_tasks_total,
        v_habits_completed,
        v_habits_total,
        v_income,
        v_expense,
        v_transactions_count,
        v_notes_created,
        v_ideas_captured
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        prayers_completed = EXCLUDED.prayers_completed,
        quran_pages_read = EXCLUDED.quran_pages_read,
        quran_minutes = EXCLUDED.quran_minutes,
        dhikr_count = EXCLUDED.dhikr_count,
        tasks_completed = EXCLUDED.tasks_completed,
        tasks_total = EXCLUDED.tasks_total,
        habits_completed = EXCLUDED.habits_completed,
        habits_total = EXCLUDED.habits_total,
        income_amount = EXCLUDED.income_amount,
        expense_amount = EXCLUDED.expense_amount,
        transactions_count = EXCLUDED.transactions_count,
        notes_created = EXCLUDED.notes_created,
        ideas_captured = EXCLUDED.ideas_captured,
        updated_at = NOW();

    -- Calculate scores
    PERFORM calculate_daily_scores(p_user_id, p_date);
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate data for all users for a date range
CREATE OR REPLACE FUNCTION aggregate_all_users_data(
    p_start_date DATE,
    p_end_date DATE
) RETURNS void AS $$
DECLARE
    v_user RECORD;
    v_date DATE;
BEGIN
    -- Loop through all users
    FOR v_user IN SELECT id FROM auth.users LOOP
        -- Loop through each date in the range
        v_date := p_start_date;
        WHILE v_date <= p_end_date LOOP
            PERFORM aggregate_daily_data(v_user.id, v_date);
            v_date := v_date + INTERVAL '1 day';
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Aggregation complete for all users from % to %', p_start_date, p_end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Aggregate data for the last 30 days for all users
-- SELECT aggregate_all_users_data(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Example 2: Aggregate data for a specific user for the last 7 days
-- SELECT aggregate_daily_data('your-user-id', CURRENT_DATE - INTERVAL '7 days');

-- Example 3: Aggregate data for the entire year 2026 for all users
-- SELECT aggregate_all_users_data('2026-01-01', '2026-12-31');

-- =====================================================
-- RUN THIS TO POPULATE DATA FOR ALL USERS
-- =====================================================

-- Populate last 90 days for all users (adjust date range as needed)
SELECT aggregate_all_users_data(
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE
);

RAISE NOTICE 'Daily activity summary populated successfully for all users!';
