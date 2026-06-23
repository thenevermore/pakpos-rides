-- Add status tracking to fuel_prices
ALTER TABLE fuel_prices ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE fuel_prices ADD COLUMN IF NOT EXISTS last_verified TIMESTAMPTZ;

-- Set all existing rows as active + verified now
UPDATE fuel_prices SET is_active = TRUE, last_verified = NOW() WHERE is_active IS NULL;
