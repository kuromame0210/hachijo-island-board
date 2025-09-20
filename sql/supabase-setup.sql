-- Create posts table for hachijo-board
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE hachijo_post_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER,
  category TEXT NOT NULL,
  contact TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies if needed
-- For now, allowing public access for demonstration
ALTER TABLE hachijo_post_board ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON hachijo_post_board
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON hachijo_post_board
  FOR INSERT WITH CHECK (true);