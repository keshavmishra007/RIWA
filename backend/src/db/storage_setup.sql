-- ====================================================================
-- RIWA — Storage Setup for Supabase
-- Creates the public 'report-evidence' bucket and sets RLS policies
-- ====================================================================

-- 1. Create the storage bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-evidence',
  'report-evidence',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public Evidence Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads to report-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Reads from report-evidence" ON storage.objects;

-- 3. Policy: Allow public uploads (INSERT) to report-evidence bucket
CREATE POLICY "Allow Public Uploads to report-evidence"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'report-evidence');

-- 4. Policy: Allow public reads (SELECT) from report-evidence bucket
CREATE POLICY "Allow Public Reads from report-evidence"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'report-evidence');
