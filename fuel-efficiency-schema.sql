-- =============================================
-- PakposRides: Add Fuel Efficiency Column
-- Run this in Supabase SQL Editor
-- =============================================

-- Add fuel_efficiency column (km/L) to motorcycles
ALTER TABLE motorcycles ADD COLUMN IF NOT EXISTS fuel_efficiency NUMERIC(5,1);

COMMENT ON COLUMN motorcycles.fuel_efficiency IS 'Fuel efficiency in km/L (kilometers per liter)';
