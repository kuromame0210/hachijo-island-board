-- Update schema to support multiple images
-- Run this SQL in your Supabase SQL Editor

-- Add new column for multiple images (JSON array)
ALTER TABLE hachijo_post_board ADD COLUMN IF NOT EXISTS images TEXT[];

-- Optional: Keep the old image_url for backward compatibility
-- You can remove this later if not needed

-- Update existing data to use new images array format
UPDATE hachijo_post_board
SET images = CASE
  WHEN image_url IS NOT NULL AND image_url != ''
  THEN ARRAY[image_url]
  ELSE ARRAY[]::TEXT[]
END
WHERE images IS NULL;