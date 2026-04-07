-- ──────────────────────────────────────────────────────────
--  Plate App – Initial Schema
--  Run this in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text unique,
  avatar_url    text,
  username      text unique,
  home_city     text default 'תל אביב',
  privacy_level text default 'public' check (privacy_level in ('public','followers','private')),
  created_at    timestamptz default now()
);

-- Seed a default dev user
insert into users (id, name, username, home_city)
values ('00000000-0000-0000-0000-000000000001', 'גל לפידות', '@gal', 'תל אביב')
on conflict (id) do nothing;

-- ── Places ────────────────────────────────────────────────
create table if not exists places (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  address         text,
  lat             double precision,
  lng             double precision,
  google_place_id text,
  hours           jsonb,
  website         text,
  photo_url       text,
  parking         text,
  happy_hour      text,
  personal_note   text,
  is_favorite     boolean default false,
  is_regular      boolean default false,
  last_visited    date,
  created_by      uuid references users(id) on delete set null,
  created_at      timestamptz default now()
);

-- ── Place Ratings ─────────────────────────────────────────
create table if not exists place_ratings (
  id               uuid primary key default gen_random_uuid(),
  place_id         uuid references places(id) on delete cascade not null,
  user_id          uuid references users(id) on delete cascade not null,
  meal_type        text not null,
  experience_type  text,
  taste            text,
  spread           text,
  aesthetic        text,
  service          text,
  need_reservation text,
  price            text,
  computed_score   integer,
  tags             text[] default '{}',
  created_at       timestamptz default now()
);

-- ── Follows ───────────────────────────────────────────────
create table if not exists follows (
  follower_id  uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

-- ── Wishlists ─────────────────────────────────────────────
create table if not exists wishlists (
  user_id    uuid references users(id) on delete cascade,
  place_id   uuid references places(id) on delete cascade,
  added_from text,
  added_note text,
  priority   text default 'medium' check (priority in ('high','medium','low')),
  saved_at   timestamptz default now(),
  primary key (user_id, place_id)
);

-- ── Row Level Security ────────────────────────────────────
alter table users         enable row level security;
alter table places        enable row level security;
alter table place_ratings enable row level security;
alter table follows       enable row level security;
alter table wishlists     enable row level security;

-- Drop existing policies before recreating
drop policy if exists "public read users"         on users;
drop policy if exists "public read places"        on places;
drop policy if exists "public read place_ratings" on place_ratings;
drop policy if exists "public read follows"       on follows;
drop policy if exists "public read wishlists"     on wishlists;

drop policy if exists "public insert places"        on places;
drop policy if exists "public insert place_ratings" on place_ratings;
drop policy if exists "public insert wishlists"     on wishlists;
drop policy if exists "public delete wishlists"     on wishlists;
drop policy if exists "public update places"        on places;

-- Permissive policies for development (replace with auth-based later)
create policy "public read users"         on users         for select using (true);
create policy "public read places"        on places        for select using (true);
create policy "public read place_ratings" on place_ratings for select using (true);
create policy "public read follows"       on follows       for select using (true);
create policy "public read wishlists"     on wishlists     for select using (true);

create policy "public insert places"        on places        for insert with check (true);
create policy "public insert place_ratings" on place_ratings for insert with check (true);
create policy "public insert wishlists"     on wishlists     for insert with check (true);
create policy "public delete wishlists"     on wishlists     for delete using (true);
create policy "public update places"        on places        for update using (true);

-- ── Helpful view: places with latest rating ───────────────
create or replace view places_with_scores as
  select
    p.*,
    r.meal_type,
    r.experience_type,
    r.taste,
    r.spread,
    r.aesthetic,
    r.service,
    r.computed_score,
    r.tags,
    r.price,
    u.name     as creator_name,
    u.username as creator_username
  from places p
  left join place_ratings r on r.place_id = p.id
  left join users u on u.id = p.created_by;
