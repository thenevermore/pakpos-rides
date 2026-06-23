-- =============================================
-- PakposRides: Add fuel_tank_capacity column
-- Run this in Supabase SQL Editor
-- =============================================

ALTER TABLE motorcycles ADD COLUMN IF NOT EXISTS fuel_tank_capacity NUMERIC(4,1);
