/*
# Add description column to files + make storage bucket public

## Changes
1. Add `description` text column to files table (nullable, for optional file descriptions)
2. Update the storage bucket `bin-files` to be public so public file URLs work for visitors

## Notes
- The description column is additive and nullable — no data loss
- The storage bucket must be public for the getPublicUrl() approach to work for public files
- Private files are protected at the database level by RLS (is_public = false rows are hidden from anon)
*/

ALTER TABLE files ADD COLUMN IF NOT EXISTS description text;

UPDATE storage.buckets SET public = true WHERE id = 'bin-files';
