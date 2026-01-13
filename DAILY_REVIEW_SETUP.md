# Daily Review & Life Heatmap Setup Guide

## 🎯 Overview

This guide will help you set up the new **Daily Review** and **Life Heatmap** features in SABR OS.

## 📋 What's Included

### 1. **Daily Review Page** (`/daily-review`)
- View comprehensive daily activity summary
- See scores for Spiritual, Productivity, and Wellness
- Track prayers, tasks, habits, and more
- Add daily reflections and journal entries
- Navigate between different dates

### 2. **Life Heatmap Page** (`/life-heatmap`)
- GitHub-style contribution calendar
- Visualize your entire year at a glance
- Track streaks and patterns
- See activity intensity with color coding
- Click any day to view details

## 🚀 Setup Instructions

### Step 1: Run the SQL Schema

1. Open **Supabase Dashboard** (https://supabase.com)
2. Go to your project
3. Navigate to **SQL Editor**
4. Open the file: `supabase_daily_review_schema.sql`
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`

This will create:
- ✅ `daily_reflections` table
- ✅ `daily_activity_summary` table
- ✅ `activity_timeline` table
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for score calculation

### Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see 3 new tables:
   - `daily_reflections`
   - `daily_activity_summary`
   - `activity_timeline`

### Step 3: Test the Features

1. Run your app: `npm run dev`
2. Navigate to **Daily Review** from the sidebar
3. Navigate to **Life Heatmap** from the sidebar
4. Add a daily reflection
5. Check the heatmap visualization

## 📊 How It Works

### Data Flow

```
User Activities (Tasks, Prayers, etc.)
         ↓
Automatic Aggregation
         ↓
daily_activity_summary table
         ↓
Score Calculation
         ↓
Display in Daily Review & Heatmap
```

### Score Calculation

**Spiritual Score (0-100):**
- Prayers: 40 points (8 points per prayer)
- Quran Reading: 30 points (10 points per page, max 3)
- Dhikr: 30 points (1 point per 10 dhikr, max 300)

**Productivity Score (0-100):**
- Tasks Completed: 40 points
- Habits Completed: 30 points
- Deep Work: 30 points (1 point per 6 minutes, max 180 min)

**Wellness Score (0-100):**
- Exercise: 30 points (1 point per 3 minutes, max 90 min)
- Sleep: 35 points (7-9 hours = 35, 6-10 hours = 20)
- Water: 35 points (4 points per glass, max 8-9 glasses)

**Overall Score:**
- Average of all three category scores

## 🎨 Features

### Daily Review
- ✅ Date navigation (previous/next/today)
- ✅ Category breakdown with scores
- ✅ Detailed metrics for each category
- ✅ Finance, reading, notes, and ideas tracking
- ✅ Daily reflection editor
- ✅ Color-coded scores (green/yellow/orange/red)

### Life Heatmap
- ✅ Full year visualization
- ✅ Year navigation
- ✅ Activity intensity colors
- ✅ Current streak tracking
- ✅ Longest streak tracking
- ✅ Average score calculation
- ✅ Completion percentage
- ✅ Click any day to view details

## 🔄 Auto-Population (Future Enhancement)

Currently, the summary data needs to be populated manually or through integration with existing features. Future updates will include:

- Automatic aggregation from Tasks, Habits, Ibadat, etc.
- Real-time updates when activities are completed
- Background jobs to calculate daily scores
- Activity timeline auto-population

## 📝 Manual Data Entry (For Testing)

You can manually insert test data:

```sql
-- Insert a test daily summary
INSERT INTO daily_activity_summary (
  user_id,
  date,
  prayers_completed,
  prayers_total,
  quran_pages_read,
  tasks_completed,
  tasks_total,
  habits_completed,
  habits_total
) VALUES (
  'your-user-id-here',
  '2026-01-13',
  5,
  5,
  2,
  8,
  10,
  5,
  7
);

-- Calculate scores
SELECT * FROM calculate_daily_scores('your-user-id-here', '2026-01-13');
```

## 🎯 Next Steps

1. **Run the SQL schema** in Supabase
2. **Test the pages** to ensure they load
3. **Add test data** to see the visualizations
4. **Integrate with existing features** (Tasks, Ibadat, etc.)
5. **Set up automatic aggregation** (future enhancement)

## 🐛 Troubleshooting

### Tables not found error
- Make sure you ran the SQL schema in Supabase
- Check that RLS policies are enabled
- Verify you're logged in with a valid user

### No data showing
- Add test data manually (see above)
- Check that `user_id` matches your logged-in user
- Verify date format is 'YYYY-MM-DD'

### Scores not calculating
- Run the `calculate_daily_scores()` function manually
- Check that summary data exists for the date
- Verify all numeric fields are not null

## 📚 Files Created

- `src/pages/DailyReview.tsx` - Daily Review page component
- `src/pages/LifeHeatmap.tsx` - Life Heatmap page component
- `src/types/dailyReview.ts` - TypeScript types
- `supabase_daily_review_schema.sql` - Database schema
- `DAILY_REVIEW_SETUP.md` - This file

## ✨ Enjoy!

You now have powerful tools to review your daily progress and visualize your life journey! 🌙

---

**Created**: January 13, 2026  
**Version**: 1.0.0
