-- ──────────────────────────────────────────────────────────
--  Plate App – Storage bucket for avatars
--  Run in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

-- Create public avatars bucket (5MB limit, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Allow anyone to read avatars
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
drop policy if exists "avatars auth upload" on storage.objects;
create policy "avatars auth upload" on storage.objects
  for insert with check (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to replace their avatar
drop policy if exists "avatars auth update" on storage.objects;
create policy "avatars auth update" on storage.objects
  for update using (bucket_id = 'avatars' AND auth.role() = 'authenticated');
