-- =============================================
-- PakposRides: fuel_prices table + initial data
-- Run this in Supabase SQL Editor
-- =============================================

-- Create fuel_prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
  id TEXT PRIMARY KEY,
  fuel_brand_id TEXT REFERENCES fuel_brands(id) ON DELETE CASCADE,
  price_per_liter INTEGER NOT NULL,
  region TEXT DEFAULT 'Jawa',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read fuel_prices" ON fuel_prices
  FOR SELECT USING (true);

-- Authenticated CRUD
CREATE POLICY "Admin insert fuel_prices" ON fuel_prices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update fuel_prices" ON fuel_prices
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin delete fuel_prices" ON fuel_prices
  FOR DELETE TO authenticated USING (true);

-- Seed initial fuel prices (current Indonesian market prices as of June 2025)
INSERT INTO fuel_prices (id, fuel_brand_id, price_per_liter, region) VALUES
  ('fp_001', 'fb_001', 10000, 'Jawa'),  -- Pertalite
  ('fp_002', 'fb_002', 16250, 'Jawa'),  -- Pertamax
  ('fp_003', 'fb_003', 20750, 'Jawa'),  -- Pertamax Turbo
  ('fp_004', 'fb_004', 13700, 'Jawa'),  -- Shell Super
  ('fp_005', 'fb_005', 16100, 'Jawa'),  -- Shell V-Power
  ('fp_006', 'fb_006', 13400, 'Jawa'),  -- BP 92
  ('fp_007', 'fb_007', 15900, 'Jawa'),  -- BP 95
  ('fp_008', 'fb_008', 12800, 'Jawa'),   -- Shell Regular
  ('fp_009', 'fb_009', 17000, 'Jawa')   -- Pertamax Green
ON CONFLICT (id) DO NOTHING;
