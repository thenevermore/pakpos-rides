-- Pakpos Rides - Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Brands table
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motorcycles table
CREATE TABLE motorcycles (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model_code TEXT NOT NULL,
  name TEXT NOT NULL,
  latest_price BIGINT NOT NULL DEFAULT 0,
  compression_ratio TEXT NOT NULL,
  engine_type TEXT NOT NULL,
  transmission_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sport', 'matic', 'bebek', 'naked', 'trail')),
  image_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel brands table
CREATE TABLE fuel_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  octane INTEGER NOT NULL,
  logo_url TEXT,
  producer TEXT NOT NULL
);

-- Oil brands table
CREATE TABLE oil_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_type TEXT NOT NULL,
  viscosity TEXT NOT NULL,
  certification TEXT NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('daily', 'touring')),
  logo_url TEXT
);

-- Knowledge base (recommendations mapping)
CREATE TABLE knowledge_base (
  id TEXT PRIMARY KEY,
  motorcycle_id TEXT NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
  min_octane INTEGER NOT NULL,
  ideal_octane INTEGER NOT NULL,
  fuel_brand_ids TEXT[] NOT NULL DEFAULT '{}',
  oil_daily_ids TEXT[] NOT NULL DEFAULT '{}',
  oil_touring_ids TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE(motorcycle_id)
);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON motorcycles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fuel_brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON oil_brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON knowledge_base FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_motorcycles_brand_id ON motorcycles(brand_id);
CREATE INDEX idx_motorcycles_category ON motorcycles(category);
CREATE INDEX idx_knowledge_base_motorcycle_id ON knowledge_base(motorcycle_id);
