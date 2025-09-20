-- Setup Supabase Storage for image uploads
-- Run this SQL in your Supabase SQL Editor

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images');

-- Allow users to delete their own uploads (optional)
CREATE POLICY "Allow delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'post-images');