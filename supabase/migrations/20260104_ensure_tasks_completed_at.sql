-- Ensure tasks table has completed_at column
-- This migration is safe to run multiple times (idempotent)

-- Add completed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added completed_at column to tasks table';
    ELSE
        RAISE NOTICE 'completed_at column already exists in tasks table';
    END IF;
END $$;
