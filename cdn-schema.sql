-- =============================================
-- PakposRides: Schema Update for ImageKit CDN
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add cdn_url columns to all tables with images
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;
ALTER TABLE motorcycles ADD COLUMN IF NOT EXISTS cdn_url TEXT;
ALTER TABLE oil_brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;
ALTER TABLE fuel_brands ADD COLUMN IF NOT EXISTS cdn_url TEXT;

-- 2. Add comments for documentation
COMMENT ON COLUMN brands.cdn_url IS 'ImageKit CDN URL for brand logo';
COMMENT ON COLUMN motorcycles.cdn_url IS 'ImageKit CDN URL for motorcycle image';
COMMENT ON COLUMN oil_brands.cdn_url IS 'ImageKit CDN URL for oil brand logo';
COMMENT ON COLUMN fuel_brands.cdn_url IS 'ImageKit CDN URL for fuel brand logo';

-- 3. Note: original logo_url/image_url columns are kept as source reference
