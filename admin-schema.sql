-- =============================================
-- PakposRides: Schema Update for Admin Panel
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add affiliate_url columns
ALTER TABLE oil_brands ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE fuel_brands ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- 2. Enable Supabase Auth (Email provider)
-- Note: Also enable Email provider in Dashboard > Authentication > Providers > Email

-- 3. RLS Policies for admin write access
-- Oil brands: allow authenticated users to insert/update
CREATE POLICY "Admin insert oil_brands" ON oil_brands
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update oil_brands" ON oil_brands
  FOR UPDATE TO authenticated USING (true);

-- Fuel brands: allow authenticated users to insert/update
CREATE POLICY "Admin insert fuel_brands" ON fuel_brands
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update fuel_brands" ON fuel_brands
  FOR UPDATE TO authenticated USING (true);

-- Motorcycles: allow authenticated users to insert/update
CREATE POLICY "Admin insert motorcycles" ON motorcycles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update motorcycles" ON motorcycles
  FOR UPDATE TO authenticated USING (true);

-- Brands: allow authenticated users to insert/update
CREATE POLICY "Admin insert brands" ON brands
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update brands" ON brands
  FOR UPDATE TO authenticated USING (true);
