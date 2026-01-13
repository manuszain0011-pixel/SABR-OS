-- =====================================================
-- SABR OS - Daily Review & Life Heatmap Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Table: daily_reflections
-- Stores user's daily journal entries and overall scores
CREATE TABLE IF NOT EXISTS public.daily_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reflection_text TEXT,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    mood VARCHAR(50), -- e.g., 'happy', 'productive', 'stressed', 'peaceful'
    gratitude TEXT[], -- Array of things user is grateful for
    lessons_learned TEXT,
    tomorrow_goals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Table: daily_activity_summary
-- Aggregated summary of all activities for a specific day
CREATE TABLE IF NOT EXISTS public.daily_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Spiritual metrics
    prayers_completed INTEGER DEFAULT 0,
    prayers_total INTEGER DEFAULT 5,
    quran_pages_read INTEGER DEFAULT 0,
    quran_minutes INTEGER DEFAULT 0,
    dhikr_count INTEGER DEFAULT 0,
    
    -- Productivity metrics
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    habits_completed INTEGER DEFAULT 0,
    habits_total INTEGER DEFAULT 0,
    goals_progress JSONB DEFAULT '{}', -- {goal_id: progress_percentage}
    
    -- Time tracking
    deep_work_minutes INTEGER DEFAULT 0,
    project_time_minutes INTEGER DEFAULT 0,
    
    -- Finance
    income_amount DECIMAL(10,2) DEFAULT 0,
    expense_amount DECIMAL(10,2) DEFAULT 0,
    transactions_count INTEGER DEFAULT 0,
    
    -- Learning
    books_pages_read INTEGER DEFAULT 0,
    notes_created INTEGER DEFAULT 0,
    ideas_captured INTEGER DEFAULT 0,
    
    -- Wellness
    exercise_minutes INTEGER DEFAULT 0,
    sleep_hours DECIMAL(3,1),
    water_glasses INTEGER DEFAULT 0,
    
    -- Calculated scores
    spiritual_score INTEGER,
    productivity_score INTEGER,
    wellness_score INTEGER,
    overall_score INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Table: activity_timeline
-- Detailed timeline of individual activities throughout the day
CREATE TABLE IF NOT EXISTS public.activity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'prayer', 'task', 'habit', 'quran', 'expense', etc.
    activity_category VARCHAR(50), -- 'spiritual', 'productivity', 'finance', 'wellness', etc.
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20), -- 'completed', 'pending', 'skipped'
    reference_id UUID, -- ID of the related record (task_id, habit_id, etc.)
    metadata JSONB, -- Additional data specific to activity type
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON public.daily_reflections(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_date ON public.daily_activity_summary(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_user_date ON public.activity_timeline(user_id, date DESC, time DESC);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_type ON public.activity_timeline(activity_type);

-- Enable Row Level Security
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_reflections
CREATE POLICY "Users can view own reflections"
    ON public.daily_reflections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
    ON public.daily_reflections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
    ON public.daily_reflections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
    ON public.daily_reflections FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for daily_activity_summary
CREATE POLICY "Users can view own activity summary"
    ON public.daily_activity_summary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity summary"
    ON public.daily_activity_summary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity summary"
    ON public.daily_activity_summary FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity summary"
    ON public.daily_activity_summary FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for activity_timeline
CREATE POLICY "Users can view own timeline"
    ON public.activity_timeline FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline"
    ON public.activity_timeline FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline"
    ON public.activity_timeline FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline"
    ON public.activity_timeline FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_daily_reflections_updated_at
    BEFORE UPDATE ON public.daily_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_summary_updated_at
    BEFORE UPDATE ON public.daily_activity_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate daily scores
CREATE OR REPLACE FUNCTION calculate_daily_scores(
    p_user_id UUID,
    p_date DATE
) RETURNS TABLE (
    spiritual_score INTEGER,
    productivity_score INTEGER,
    wellness_score INTEGER,
    overall_score INTEGER
) AS $$
DECLARE
    v_spiritual INTEGER := 0;
    v_productivity INTEGER := 0;
    v_wellness INTEGER := 0;
    v_overall INTEGER := 0;
    v_summary RECORD;
BEGIN
    -- Get the summary for the date
    SELECT * INTO v_summary
    FROM public.daily_activity_summary
    WHERE user_id = p_user_id AND date = p_date;
    
    IF FOUND THEN
        -- Calculate spiritual score (0-100)
        v_spiritual := LEAST(100, (
            (CASE WHEN v_summary.prayers_total > 0 
                THEN (v_summary.prayers_completed::FLOAT / v_summary.prayers_total * 40)::INTEGER 
                ELSE 0 END) +
            (LEAST(v_summary.quran_pages_read * 10, 30)) +
            (LEAST(v_summary.dhikr_count / 10, 30))
        ));
        
        -- Calculate productivity score (0-100)
        v_productivity := LEAST(100, (
            (CASE WHEN v_summary.tasks_total > 0 
                THEN (v_summary.tasks_completed::FLOAT / v_summary.tasks_total * 40)::INTEGER 
                ELSE 0 END) +
            (CASE WHEN v_summary.habits_total > 0 
                THEN (v_summary.habits_completed::FLOAT / v_summary.habits_total * 30)::INTEGER 
                ELSE 0 END) +
            (LEAST(v_summary.deep_work_minutes / 6, 30))
        ));
        
        -- Calculate wellness score (0-100)
        v_wellness := LEAST(100, (
            (LEAST(v_summary.exercise_minutes / 3, 30)) +
            (CASE WHEN v_summary.sleep_hours >= 7 AND v_summary.sleep_hours <= 9 
                THEN 35 
                WHEN v_summary.sleep_hours >= 6 AND v_summary.sleep_hours <= 10 
                THEN 20 
                ELSE 0 END) +
            (LEAST(v_summary.water_glasses * 4, 35))
        ));
        
        -- Calculate overall score (average of all three)
        v_overall := ((v_spiritual + v_productivity + v_wellness) / 3)::INTEGER;
        
        -- Update the summary with calculated scores
        UPDATE public.daily_activity_summary
        SET 
            spiritual_score = v_spiritual,
            productivity_score = v_productivity,
            wellness_score = v_wellness,
            overall_score = v_overall
        WHERE user_id = p_user_id AND date = p_date;
    END IF;
    
    RETURN QUERY SELECT v_spiritual, v_productivity, v_wellness, v_overall;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.daily_reflections TO authenticated;
GRANT ALL ON public.daily_activity_summary TO authenticated;
GRANT ALL ON public.activity_timeline TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Daily Review & Life Heatmap schema created successfully!';
    RAISE NOTICE 'Tables created: daily_reflections, daily_activity_summary, activity_timeline';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Helper function created: calculate_daily_scores()';
END $$;
