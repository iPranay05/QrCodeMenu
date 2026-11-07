-- ============================================================
-- MenuQR — Add QR Design Customization to Restaurants Migration
-- Run this in your Supabase SQL Editor:
-- ============================================================

ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS qr_design JSONB DEFAULT NULL;

COMMENT ON COLUMN restaurants.qr_design IS 'Custom QR code designer preferences, colors, shapes, logos, and frame settings';

