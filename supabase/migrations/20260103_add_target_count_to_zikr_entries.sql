-- Add missing target_count column to zikr_entries table
ALTER TABLE zikr_entries
ADD COLUMN IF NOT EXISTS target_count integer DEFAULT 0;
