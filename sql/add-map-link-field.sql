-- Add map_link field to hachijo_post_board table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE hachijo_post_board 
ADD COLUMN IF NOT EXISTS map_link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN hachijo_post_board.map_link IS 'Google Maps link URL for post location';