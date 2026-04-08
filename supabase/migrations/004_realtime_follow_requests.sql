-- ──────────────────────────────────────────────────────────
--  Enable Realtime on follow_requests so the app badge
--  updates live when a new follow request comes in.
--
--  REPLICA IDENTITY FULL lets Supabase stream the full row
--  (including to_user_id) on INSERT, which makes the
--  `filter: to_user_id=eq.<uid>` param in the JS client work.
--
--  Run in Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────

alter table follow_requests replica identity full;

-- Add to the realtime publication (safe to run multiple times)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'follow_requests'
  ) then
    alter publication supabase_realtime add table follow_requests;
  end if;
end$$;
