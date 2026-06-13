-- ============================================================
--  KZN Hidden Gems — Supabase setup
--  Run this once in your Supabase project's SQL Editor.
-- ============================================================

-- One simple key/value table holds shared site state:
--   key = 'custom_locations'  -> array of admin-added / edited locations (incl. reviews & alerts)
--   key = 'site_content'      -> object of site-text overrides from the Site Content editor
create table if not exists app_state (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Allow the public anon key to read and write this table.
-- (This is a community site with a UI-level admin password — fine for shared content.)
alter table app_state enable row level security;

drop policy if exists "anyone can read app_state"  on app_state;
drop policy if exists "anyone can write app_state"  on app_state;

create policy "anyone can read app_state"
  on app_state for select using (true);

create policy "anyone can write app_state"
  on app_state for insert with check (true);

create policy "anyone can update app_state"
  on app_state for update using (true) with check (true);

-- Seed the two rows so the first read always succeeds
insert into app_state (key, value) values
  ('custom_locations', '[]'::jsonb),
  ('site_content',     '{}'::jsonb)
on conflict (key) do nothing;
