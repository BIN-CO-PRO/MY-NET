/*
# Add missing columns to profiles table

## Changes
- Add `location`, `email`, `phone` columns to profiles
- Add `certifications`, `skills`, `journey` jsonb columns to profiles
- Rename `avatar_url` usage stays (no rename, just use existing column)
- Update default profile data with realistic content for Bizimana Fils

## Notes
- All new columns are nullable or have defaults, so existing data is preserved
- No data loss — only additive changes
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text DEFAULT 'Kigali, Rwanda';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT 'bizimanaideanexuscompany@gmail.com';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS journey jsonb DEFAULT '[]'::jsonb;
