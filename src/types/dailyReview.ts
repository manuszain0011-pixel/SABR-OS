// Types for Daily Review and Life Heatmap features

export interface DailyReflection {
    id: string;
    user_id: string;
    date: string; // ISO date string
    reflection_text?: string;
    overall_score?: number; // 0-100
    mood?: string;
    gratitude?: string[];
    lessons_learned?: string;
    tomorrow_goals?: string;
    created_at: string;
    updated_at: string;
}

export interface DailyActivitySummary {
    id: string;
    user_id: string;
    date: string; // ISO date string

    // Spiritual metrics
    prayers_completed: number;
    prayers_total: number;
    quran_pages_read: number;
    quran_minutes: number;
    dhikr_count: number;

    // Productivity metrics
    tasks_completed: number;
    tasks_total: number;
    habits_completed: number;
    habits_total: number;
    goals_progress: Record<string, number>; // {goal_id: progress_percentage}

    // Time tracking
    deep_work_minutes: number;
    project_time_minutes: number;

    // Finance
    income_amount: number;
    expense_amount: number;
    transactions_count: number;

    // Learning
    books_pages_read: number;
    notes_created: number;
    ideas_captured: number;

    // Wellness
    exercise_minutes: number;
    sleep_hours?: number;
    water_glasses: number;

    // Calculated scores
    spiritual_score?: number;
    productivity_score?: number;
    wellness_score?: number;
    overall_score?: number;

    created_at: string;
    updated_at: string;
}

export interface ActivityTimelineItem {
    id: string;
    user_id: string;
    date: string; // ISO date string
    time: string; // HH:MM:SS
    activity_type: string; // 'prayer', 'task', 'habit', 'quran', 'expense', etc.
    activity_category: string; // 'spiritual', 'productivity', 'finance', 'wellness', etc.
    title: string;
    description?: string;
    status?: string; // 'completed', 'pending', 'skipped'
    reference_id?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface DailyScores {
    spiritual_score: number;
    productivity_score: number;
    wellness_score: number;
    overall_score: number;
}

export interface HeatmapDay {
    date: string;
    score: number; // 0-100
    activities_count: number;
    has_reflection: boolean;
}
