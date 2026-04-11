-- ──────────────────────────────────────────────────────────
--  Plate App – General Notifications Table
--  Run this in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  type         text not null,          -- e.g. 'place_share'
  from_user_id uuid references users(id) on delete cascade not null,
  to_user_id   uuid references users(id) on delete cascade not null,
  place_id     uuid references places(id) on delete cascade,
  message      text,
  read         boolean not null default false,
  created_at   timestamptz default now()
);

create index if not exists notifications_to_user_idx   on notifications(to_user_id);
create index if not exists notifications_from_user_idx on notifications(from_user_id);
create index if not exists notifications_type_idx      on notifications(type);
