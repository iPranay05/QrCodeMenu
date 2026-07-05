-- ============================================================
-- QR Menu Platform — Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/zzxksexzlsoalzcvfjes
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- TABLES
-- ========================

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_url TEXT,
  tagline TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  primary_color TEXT DEFAULT '#F97316',
  theme TEXT,
  background_image_url TEXT,
  opening_time TEXT,
  closing_time TEXT,
  delivery_platforms JSONB DEFAULT '[]'::jsonb,
  live_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_veg BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- ROW LEVEL SECURITY
-- ========================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Restaurants: public read, owner write
DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;
CREATE POLICY "Public can view restaurants" ON restaurants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can insert restaurants" ON restaurants;
CREATE POLICY "Owners can insert restaurants" ON restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can update their restaurant" ON restaurants;
CREATE POLICY "Owners can update their restaurant" ON restaurants FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can delete their restaurant" ON restaurants;
CREATE POLICY "Owners can delete their restaurant" ON restaurants FOR DELETE USING (auth.uid() = user_id);

-- Menu categories: public read, owner write
DROP POLICY IF EXISTS "Public can view categories" ON menu_categories;
CREATE POLICY "Public can view categories" ON menu_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can insert categories" ON menu_categories;
CREATE POLICY "Owners can insert categories" ON menu_categories FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can update categories" ON menu_categories;
CREATE POLICY "Owners can update categories" ON menu_categories FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can delete categories" ON menu_categories;
CREATE POLICY "Owners can delete categories" ON menu_categories FOR DELETE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Menu items: public read, owner write
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can insert menu items" ON menu_items;
CREATE POLICY "Owners can insert menu items" ON menu_items FOR INSERT
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can update menu items" ON menu_items;
CREATE POLICY "Owners can update menu items" ON menu_items FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can delete menu items" ON menu_items;
CREATE POLICY "Owners can delete menu items" ON menu_items FOR DELETE
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Orders: public insert, owner read/update/delete
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Owners can view orders" ON orders;
CREATE POLICY "Owners can view orders" ON orders FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can update orders" ON orders;
CREATE POLICY "Owners can update orders" ON orders FOR UPDATE USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can delete orders" ON orders;
CREATE POLICY "Owners can delete orders" ON orders FOR DELETE USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Order items: public insert, owner read/update/delete
DROP POLICY IF EXISTS "Public can insert order items" ON order_items;
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Owners can view order items" ON order_items;
CREATE POLICY "Owners can view order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "Owners can update order items" ON order_items;
CREATE POLICY "Owners can update order items" ON order_items FOR UPDATE USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));
DROP POLICY IF EXISTS "Owners can delete order items" ON order_items;
CREATE POLICY "Owners can delete order items" ON order_items FOR DELETE USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));

-- ========================
-- AUTO-UPDATE TRIGGER
-- ========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- STORAGE BUCKETS
-- ========================
-- Run in the Storage section OR via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-items', 'menu-items', true) ON CONFLICT DO NOTHING;

-- Storage policies (allow anyone to read, authenticated to upload)
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
DROP POLICY IF EXISTS "Auth upload logos" ON storage.objects;
CREATE POLICY "Auth upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth update logos" ON storage.objects;
CREATE POLICY "Auth update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid() = owner);
DROP POLICY IF EXISTS "Auth delete logos" ON storage.objects;
CREATE POLICY "Auth delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
DROP POLICY IF EXISTS "Auth upload covers" ON storage.objects;
CREATE POLICY "Auth upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth update covers" ON storage.objects;
CREATE POLICY "Auth update covers" ON storage.objects FOR UPDATE USING (bucket_id = 'covers' AND auth.uid() = owner);
DROP POLICY IF EXISTS "Auth delete covers" ON storage.objects;
CREATE POLICY "Auth delete covers" ON storage.objects FOR DELETE USING (bucket_id = 'covers' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Public read menu-items" ON storage.objects;
CREATE POLICY "Public read menu-items" ON storage.objects FOR SELECT USING (bucket_id = 'menu-items');
DROP POLICY IF EXISTS "Auth upload menu-items" ON storage.objects;
CREATE POLICY "Auth upload menu-items" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-items' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth update menu-items" ON storage.objects;
CREATE POLICY "Auth update menu-items" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-items' AND auth.uid() = owner);
DROP POLICY IF EXISTS "Auth delete menu-items" ON storage.objects;
CREATE POLICY "Auth delete menu-items" ON storage.objects FOR DELETE USING (bucket_id = 'menu-items' AND auth.uid() = owner);
