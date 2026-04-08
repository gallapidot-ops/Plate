-- ──────────────────────────────────────────────────────────
--  Plate App – Follow Requests + Follows policies
--  Run in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

-- ── Follow Requests ───────────────────────────────────────
create table if not exists follow_requests (
  id           uuid primary key default gen_random_uuid(),
  from_user_id uuid references users(id) on delete cascade not null,
  to_user_id   uuid references users(id) on delete cascade not null,
  status       text default 'pending' check (status in ('pending','accepted','declined')),
  created_at   timestamptz default now(),
  unique (from_user_id, to_user_id)
);

alter table follow_requests enable row level security;

drop policy if exists "public read follow_requests"   on follow_requests;
drop policy if exists "public insert follow_requests" on follow_requests;
drop policy if exists "public update follow_requests" on follow_requests;
drop policy if exists "public delete follow_requests" on follow_requests;

create policy "public read follow_requests"   on follow_requests for select using (true);
create policy "public insert follow_requests" on follow_requests for insert with check (true);
create policy "public update follow_requests" on follow_requests for update using (true);
create policy "public delete follow_requests" on follow_requests for delete using (true);

-- ── Follows insert / delete (missing from initial schema) ──
drop policy if exists "public insert follows" on follows;
drop policy if exists "public delete follows" on follows;
create policy "public insert follows" on follows for insert with check (true);
create policy "public delete follows" on follows for delete using (true);
