-- Add custom_prayer_times column to user_settings table
-- This allows users to override API-fetched prayer times with their local mosque times

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings' 
        AND column_name = 'custom_prayer_times'
    ) THEN
        ALTER TABLE public.user_settings ADD COLUMN custom_prayer_times JSONB DEFAULT '{}';
        RAISE NOTICE 'Added custom_prayer_times column to user_settings table';
    ELSE
        RAISE NOTICE 'custom_prayer_times column already exists in user_settings table';
    END IF;
END $$;

COMMENT ON COLUMN public.user_settings.custom_prayer_times IS 'Custom prayer times set by user to override API times (e.g., {"fajr": "05:30", "dhuhr": "13:15"})';
