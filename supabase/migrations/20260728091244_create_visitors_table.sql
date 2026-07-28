/*
# Create visitors table for visitor tracking

1. New Tables
- `visitors`
  - id (uuid, primary key)
  - ip (text) — visitor IP address
  - country (text) — country derived from IP
  - device (text) — desktop / mobile / tablet
  - browser (text) — browser name
  - page (text) — page path visited
  - created_at (timestamptz)

2. Security (RLS)
- Anyone (anon + authenticated) can INSERT — we need to record every visitor,
  including unauthenticated ones. No SELECT for anon — only the admin can read.
- Authenticated admin can SELECT all visitor records.
- No UPDATE or DELETE needed.

3. Notes
- This is a write-heavy, read-admin-only table.
- Visitors are tracked from the frontend via the anon key on each page load.
*/

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  country text,
  device text,
  browser text,
  page text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visitor record (tracking happens on every page load)
DROP POLICY IF EXISTS "anon_insert_visitors" ON visitors;
CREATE POLICY "anon_insert_visitors" ON visitors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated admin can read visitor data
DROP POLICY IF EXISTS "admin_read_visitors" ON visitors;
CREATE POLICY "admin_read_visitors" ON visitors FOR SELECT
  TO authenticated USING (true);

-- Index for sorting by most recent
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors (created_at DESC);
