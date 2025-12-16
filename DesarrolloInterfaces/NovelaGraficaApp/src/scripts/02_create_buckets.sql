-- Enable Storage Buckets for Themes, Fonts, and Comics

-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('themes', 'themes', true),
  ('fonts', 'fonts', true),
  ('comics', 'comics', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access Themes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Fonts" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Comics" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads Themes" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads Fonts" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads Comics" ON storage.objects;

-- 3. Create READ policies (Public Access)
CREATE POLICY "Public Access Themes" ON storage.objects FOR SELECT USING ( bucket_id = 'themes' );
CREATE POLICY "Public Access Fonts" ON storage.objects FOR SELECT USING ( bucket_id = 'fonts' );
CREATE POLICY "Public Access Comics" ON storage.objects FOR SELECT USING ( bucket_id = 'comics' );

-- 4. Create INSERT policies (Allow everyone for development, or authenticated)
-- Using 'true' for check to allow all uploads for simplicity in this dev phase
CREATE POLICY "Allow Uploads Themes" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'themes' );
CREATE POLICY "Allow Uploads Fonts" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'fonts' );
CREATE POLICY "Allow Uploads Comics" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'comics' );
