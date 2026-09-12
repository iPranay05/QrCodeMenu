-- ============================================================
-- MenuQR — Subscription & Referral Migration
-- Run this in Supabase SQL Editor AFTER the main setup SQL
-- ============================================================

-- Add subscription columns to restaurants
ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Set all existing restaurants to trial mode expiring in 7 days
UPDATE restaurants 
SET 
  subscription_status = 'trial',
  trial_ends_at = NOW() + INTERVAL '7 days'
WHERE subscription_status IS NULL OR subscription_status = '';

-- Create ambassadors table (if not already created)
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  city TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  referral_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- Ambassadors: public insert (registration), service role read
DROP POLICY IF EXISTS "Allow public registration" ON ambassadors;
CREATE POLICY "Allow public registration" ON ambassadors FOR INSERT WITH CHECK (true);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS restaurants_slug_idx ON restaurants(slug);
CREATE INDEX IF NOT EXISTS restaurants_user_id_idx ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS ambassadors_referral_code_idx ON ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS ambassadors_email_idx ON ambassadors(email);

-- Function to check subscription status (used by dashboard gate)
CREATE OR REPLACE FUNCTION get_subscription_status(restaurant_row restaurants)
RETURNS TEXT AS $$
BEGIN
  -- Trial period
  IF restaurant_row.subscription_status = 'trial' AND restaurant_row.trial_ends_at > NOW() THEN
    RETURN 'trial';
  END IF;
  
  -- Active subscription
  IF restaurant_row.subscription_status = 'active' AND restaurant_row.subscription_expires_at > NOW() THEN
    RETURN 'active';
  END IF;
  
  -- Grace period (3 days after expiry)
  IF restaurant_row.subscription_status = 'active' AND 
     restaurant_row.subscription_expires_at <= NOW() AND 
     restaurant_row.subscription_expires_at > NOW() - INTERVAL '3 days' THEN
    RETURN 'grace';
  END IF;
  
  RETURN 'expired';
END;
$$ LANGUAGE plpgsql;
