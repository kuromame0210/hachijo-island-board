-- Add location verification columns to hachijo_post_board table
-- Run this SQL in your Supabase SQL Editor to update the schema

-- Add new columns for location verification
ALTER TABLE hachijo_post_board
ADD COLUMN IF NOT EXISTS images TEXT[], -- Support for multiple images
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT false, -- Flag for location verification
ADD COLUMN IF NOT EXISTS created_location TEXT; -- Store the location coordinates where post was created

-- Update RLS policies to enforce location restrictions
-- Replace the existing public insert policy with a more restrictive one

DROP POLICY IF EXISTS "Allow public insert access" ON hachijo_post_board;

-- New policy that requires location verification
CREATE POLICY "Allow location verified insert access" ON hachijo_post_board
  FOR INSERT WITH CHECK (location_verified = true);

-- For demonstration purposes, you might want to allow bypassing this in development
-- CREATE POLICY "Allow dev insert access" ON hachijo_post_board
--   FOR INSERT WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_category ON hachijo_post_board(category);
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_created_at ON hachijo_post_board(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hachijo_post_board_location_verified ON hachijo_post_board(location_verified);

-- Add comment for documentation
COMMENT ON COLUMN hachijo_post_board.location_verified IS 'True if the post was created from within Hachijo Island boundaries';
COMMENT ON COLUMN hachijo_post_board.created_location IS 'Latitude,Longitude coordinates where the post was created';
COMMENT ON COLUMN hachijo_post_board.images IS 'Array of image URLs for the post';

-- Sample function to validate Hachijo Island location (optional)
-- This could be used in database triggers for additional security
CREATE OR REPLACE FUNCTION is_in_hachijo_island(lat NUMERIC, lng NUMERIC)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    lat >= 33.045 AND lat <= 33.155 AND
    lng >= 139.74 AND lng <= 139.81
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;