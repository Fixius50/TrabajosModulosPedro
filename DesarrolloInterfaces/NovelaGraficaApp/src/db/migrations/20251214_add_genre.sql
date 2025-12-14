-- MIGRATION: Add genre column to series table
-- Run this in your Supabase Dashboard > SQL Editor

ALTER TABLE series 
ADD COLUMN IF NOT EXISTS genre text DEFAULT 'General';

-- Optional: Update existing rows
UPDATE series SET genre = 'Cyberpunk' WHERE title LIKE '%Bosque Digital%';
