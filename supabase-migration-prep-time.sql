-- ============================================================
-- MenuQR — Add Preparation Time to Menu Items Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zzxksexzlsoalzcvfjes/sql
-- ============================================================

ALTER TABLE menu_items 
  ADD COLUMN IF NOT EXISTS preparation_time TEXT;

