-- Migration: Add time-based availability columns to menu_items
-- Run this in your Supabase SQL Editor

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS available_start_time TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS available_end_time TEXT DEFAULT NULL;

-- Optional: Add a comment explaining the format
COMMENT ON COLUMN menu_items.available_start_time IS 'HH:MM 24-hour format, e.g. "08:00". NULL means no time restriction.';
COMMENT ON COLUMN menu_items.available_end_time IS 'HH:MM 24-hour format, e.g. "22:30". NULL means no time restriction.';

