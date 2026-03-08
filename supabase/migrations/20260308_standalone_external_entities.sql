alter table if exists public.ops_user_watchlist
  drop constraint if exists ops_user_watchlist_profile_id_fkey;

alter table if exists public.ops_app_instances
  drop constraint if exists ops_app_instances_profile_id_fkey;
