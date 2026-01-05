-- Enable RLS for Storage if not already enabled
-- (Usually enabled by default, but good practice)

-- 1. Creates the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts during troubleshooting
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- 3. Create Policy: Public Read Access (Everyone can see avatars)
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 3.1 Allow Public Listing of 'common' folder (Needed for Gallery)
-- Storage list operations require specific policies usually, but Public Access above often covers SELECT.
-- However, we verify if explicit list policy is needed or simply assume public bucket handles it.
-- Supabase Storage 'Public' buckets allow unauthenticated downloads, but LIST usually requires a policy or public permissions.


-- 4. Create Policy: Authenticated Upload (Users can upload)
CREATE POLICY "Authenticated Avatar Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- 5. Create Policy: Authenticated Update (Users can replace their own files)
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- NOTE: The update policy assumes a naming convention like "USERID-timestamp.ext" 
-- or that we trust authenticated users for now. 
-- For simplicity, we also allow general uploads by authenticated users.
