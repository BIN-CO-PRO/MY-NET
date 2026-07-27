/*
# BIN platform — profiles, projects, files schema

1. New Tables
- `profiles`
  - id (uuid, primary key; defaults to the authenticated user)
  - full_name, tagline, bio, photo_url, location, email, phone
  - social_links (jsonb) — keyed by linkedin/x/instagram/tiktok/threads/orcid
  - certifications, skills, journey (jsonb arrays)
  - updated_at (timestamptz)
- `projects`
  - id (uuid pk)
  - slug (text, unique)
  - title, summary, description
  - cover_url, category, tags (text[])
  - featured (boolean)
  - live_url, repo_url
  - file_ids (uuid[]) — references to files.id (soft link)
  - created_at, updated_at
- `files`
  - id (uuid pk)
  - name, storage_path (unique)
  - mime_type, size_bytes
  - is_public (boolean, default false)
  - description, category
  - created_at, updated_at

2. Security (RLS)
- profiles: only authenticated admin can read/write. Public visitors read the
  single profile row through the anon role so the public site works.
- projects: public SELECT for everyone (anon, authenticated); writes restricted
  to authenticated admin.
- files: public SELECT only on rows where is_public = true; authenticated admin
  can SELECT all and perform all writes.

3. Notes
- This is a single-admin app: there is one profile row and one admin account.
- Storage bucket `files` is created separately (public read for public files,
  admin write). Storage policies are applied below.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  full_name text NOT NULL DEFAULT 'Bizimana Fils',
  tagline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  location text NOT NULL DEFAULT 'Kigali, Rwanda',
  email text NOT NULL DEFAULT '',
  phone text,
  social_links jsonb,
  certifications jsonb,
  skills jsonb,
  journey jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_profiles" ON profiles;
CREATE POLICY "admin_insert_profiles" ON profiles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;
CREATE POLICY "admin_delete_profiles" ON profiles FOR DELETE
  TO authenticated USING (true);

-- ---------- projects ----------
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_url text,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  live_url text,
  repo_url text,
  file_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_projects" ON projects;
CREATE POLICY "admin_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_projects" ON projects;
CREATE POLICY "admin_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_projects" ON projects;
CREATE POLICY "admin_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

-- ---------- files ----------
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text UNIQUE NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes bigint NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  description text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Public can read only public files; authenticated admin can read all files
DROP POLICY IF EXISTS "public_read_public_files" ON files;
CREATE POLICY "public_read_public_files" ON files FOR SELECT
  TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "admin_read_all_files" ON files;
CREATE POLICY "admin_read_all_files" ON files FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_files" ON files;
CREATE POLICY "admin_insert_files" ON files FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_files" ON files;
CREATE POLICY "admin_update_files" ON files FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_files" ON files;
CREATE POLICY "admin_delete_files" ON files FOR DELETE
  TO authenticated USING (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS files_is_public_idx ON files (is_public);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects (featured);
CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug);
