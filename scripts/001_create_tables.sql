-- Users table (simple nickname-based, no auth required)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily records table
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bible_chapters INTEGER DEFAULT 0,
  prayer_minutes INTEGER DEFAULT 0,
  media_minutes INTEGER DEFAULT 0,
  prayer_notes JSONB DEFAULT '[]'::jsonb,
  bible_read JSONB DEFAULT '{}'::jsonb,
  media_usage JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS but allow public read access (for sharing)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- Anyone can read users (for viewing shared profiles)
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
-- Anyone can insert users (for creating new profiles)
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- Anyone can read daily_records (for viewing shared profiles)
CREATE POLICY "Anyone can read daily_records" ON daily_records FOR SELECT USING (true);
-- Anyone can insert daily_records
CREATE POLICY "Anyone can insert daily_records" ON daily_records FOR INSERT WITH CHECK (true);
-- Anyone can update daily_records
CREATE POLICY "Anyone can update daily_records" ON daily_records FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
