DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'opening_time') THEN
        ALTER TABLE restaurants ADD COLUMN opening_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'closing_time') THEN
        ALTER TABLE restaurants ADD COLUMN closing_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'delivery_platforms') THEN
        ALTER TABLE restaurants ADD COLUMN delivery_platforms JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'live_url') THEN
        ALTER TABLE restaurants ADD COLUMN live_url TEXT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Owners can view orders" ON orders;
DROP POLICY IF EXISTS "Owners can update orders" ON orders;
DROP POLICY IF EXISTS "Owners can delete orders" ON orders;

CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view orders" ON orders FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
CREATE POLICY "Owners can update orders" ON orders FOR UPDATE USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
CREATE POLICY "Owners can delete orders" ON orders FOR DELETE USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public can insert order items" ON order_items;
DROP POLICY IF EXISTS "Owners can view order items" ON order_items;
DROP POLICY IF EXISTS "Owners can update order items" ON order_items;
DROP POLICY IF EXISTS "Owners can delete order items" ON order_items;

CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));
CREATE POLICY "Owners can update order items" ON order_items FOR UPDATE USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));
CREATE POLICY "Owners can delete order items" ON order_items FOR DELETE USING (order_id IN (SELECT id FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())));

NOTIFY pgrst, 'reload schema';
