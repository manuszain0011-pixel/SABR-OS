-- Ensure habits table has all required columns
-- This migration is safe to run multiple times (idempotent)

-- Add color column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'habits' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE public.habits ADD COLUMN color TEXT;
        RAISE NOTICE 'Added color column to habits table';
    ELSE
        RAISE NOTICE 'color column already exists in habits table';
    END IF;
END $$;

-- Add icon column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'habits' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.habits ADD COLUMN icon TEXT;
        RAISE NOTICE 'Added icon column to habits table';
    ELSE
        RAISE NOTICE 'icon column already exists in habits table';
    END IF;
END $$;
