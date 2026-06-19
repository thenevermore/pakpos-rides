-- =============================================
-- PakposRides: RLS Policies for knowledge_base
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable RLS on knowledge_base (if not already)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow public read access (already exists for anonymous)
CREATE POLICY "Public read knowledge_base" ON knowledge_base
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Admin insert knowledge_base" ON knowledge_base
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Admin update knowledge_base" ON knowledge_base
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Admin delete knowledge_base" ON knowledge_base
  FOR DELETE TO authenticated USING (true);
