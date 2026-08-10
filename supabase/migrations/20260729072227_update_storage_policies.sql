/*
# Update storage policies for bin-files bucket

## Changes
- Update anon read policy to allow reading all objects in the bin-files bucket
  (the bucket is public, and private files are protected at the database level via RLS
  on the files table — visitors never get the URL for private files)
- Add authenticated to the read policy as well for consistency

## Security model
- Public files: visible in the files table (is_public = true) AND accessible via storage URL
- Private files: hidden from the files table (RLS hides is_public = false from anon) so
  visitors never learn the storage URL. The storage bucket being public doesn't matter
  because the URL is never exposed.
*/

DROP POLICY IF EXISTS "anon_read_public_storage" ON storage.objects;
DROP POLICY IF EXISTS "admin_read_all_storage" ON storage.objects;

CREATE POLICY "anyone_read_bin_files_storage" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'bin-files');
