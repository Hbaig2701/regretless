-- Regretless Database Schema
-- Run this against your Supabase project via the SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table: experiences
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL CHECK (category_id BETWEEN 1 AND 12),
  time_estimate INTEGER NOT NULL,
  price_estimate INTEGER NOT NULL DEFAULT 0,
  party_size INTEGER NOT NULL DEFAULT 1,
  environment TEXT NOT NULL CHECK (environment IN ('indoor', 'outdoor')),
  is_curated BOOLEAN NOT NULL DEFAULT true,
  source_skip_id UUID REFERENCES experiences(id) NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: user_state (single-row for V1)
-- ============================================
CREATE TABLE IF NOT EXISTS user_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Hamza',
  location TEXT NOT NULL DEFAULT 'Toronto',
  member_since DATE DEFAULT CURRENT_DATE,
  filter_time JSONB DEFAULT '[]',
  filter_price JSONB DEFAULT '[]',
  filter_party JSONB DEFAULT '[]',
  filter_env JSONB DEFAULT '["indoor","outdoor"]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: experience_status
-- ============================================
CREATE TABLE IF NOT EXISTS experience_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'saved', 'skipped', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: memories
-- ============================================
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) NOT NULL,
  reflection TEXT NULL,
  location_text TEXT NULL,
  photo_url TEXT NULL,
  shared BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_experience_status_experience_id ON experience_status(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_status_status ON experience_status(status);
CREATE INDEX IF NOT EXISTS idx_memories_experience_id ON memories(experience_id);
CREATE INDEX IF NOT EXISTS idx_experiences_category_id ON experiences(category_id);

-- ============================================
-- Row Level Security (permissive for V1, ready for auth later)
-- ============================================
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users in V1
CREATE POLICY "Allow all for anon" ON experiences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON user_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON experience_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON memories FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage bucket for photos
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('memory-photos', 'memory-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to memory-photos bucket
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'memory-photos');
CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-photos');

-- ============================================
-- Insert default user state
-- ============================================
INSERT INTO user_state (id, name, location) VALUES (1, 'Hamza', 'Toronto')
ON CONFLICT (id) DO NOTHING;
