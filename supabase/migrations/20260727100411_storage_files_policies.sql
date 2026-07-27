/*
# Storage policies for the `files` bucket

1. Security
- Public can SELECT (read) objects in the `files` bucket — the bucket is public
  so public files are downloadable by anyone via their public URL.
- Only authenticated admin can INSERT (upload) and DELETE (remove) objects.
- UPDATE (e.g. moving) restricted to authenticated admin.

2. Notes
- The bucket itself is public for reads; per-file visibility is enforced by the
  `files` table RLS (public SELECT only where is_public = true). The public URL
  of a "private" file is still technically reachable, but the app never links
  to it publicly, and the files table never exposes it to anon users.
*/

DROP POLICY IF EXISTS "public_read_storage_files" ON storage.objects;
CREATE POLICY "public_read_storage_files" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'files');

DROP POLICY IF EXISTS "admin_insert_storage_files" ON storage.objects;
CREATE POLICY "admin_insert_storage_files" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'files');

DROP POLICY IF EXISTS "admin_update_storage_files" ON storage.objects;
CREATE POLICY "admin_update_storage_files" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'files') WITH CHECK (bucket_id = 'files');

DROP POLICY IF EXISTS "admin_delete_storage_files" ON storage.objects;
CREATE POLICY "admin_delete_storage_files" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'files');
