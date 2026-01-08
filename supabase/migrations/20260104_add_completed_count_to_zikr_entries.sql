-- Add missing completed_count column to zikr_entries table
ALTER TABLE zikr_entries
ADD COLUMN IF NOT EXISTS completed_count integer DEFAULT 0;
