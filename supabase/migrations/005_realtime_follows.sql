-- ──────────────────────────────────────────────────────────
--  Enable Realtime on follows table so the + button updates
--  to "following" the moment the other side accepts.
--
--  Run in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

alter table follows replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'follows'
  ) then
    alter publication supabase_realtime add table follows;
  end if;
end$$;
