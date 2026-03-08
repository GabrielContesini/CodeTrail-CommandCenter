create extension if not exists pgcrypto;

create or replace function public.ops_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.ops_admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_user_watchlist (
  profile_id uuid primary key,
  risk_level text not null default 'healthy'
    check (risk_level in ('healthy', 'attention', 'critical')),
  support_status text not null default 'stable'
    check (support_status in ('stable', 'monitoring', 'needs_follow_up', 'escalated')),
  internal_note text not null default '',
  next_action_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_app_instances (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  profile_id uuid,
  platform text not null check (platform in ('android', 'windows', 'web', 'api')),
  release_channel text not null default 'stable',
  app_version text not null,
  device_label text,
  machine_name text,
  environment text not null default 'production',
  status text not null default 'up'
    check (status in ('up', 'degraded', 'down')),
  last_seen_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_heartbeats (
  id bigserial primary key,
  instance_id uuid not null references public.ops_app_instances(id) on delete cascade,
  sync_backlog integer not null default 0,
  open_errors integer not null default 0,
  cpu_percent numeric(5,2),
  memory_percent numeric(5,2),
  disk_percent numeric(5,2),
  app_uptime_seconds integer,
  os_uptime_seconds integer,
  network_status text not null default 'online',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_incidents (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  source text not null,
  status text not null default 'open'
    check (status in ('open', 'investigating', 'mitigated', 'resolved')),
  summary text not null,
  suggested_action text not null default '',
  opened_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ops_instances_profile_id
  on public.ops_app_instances(profile_id);
create index if not exists idx_ops_instances_last_seen_at
  on public.ops_app_instances(last_seen_at desc);
create index if not exists idx_ops_heartbeats_instance_id_created_at
  on public.ops_heartbeats(instance_id, created_at desc);
create index if not exists idx_ops_incidents_status_opened_at
  on public.ops_incidents(status, opened_at desc);
create index if not exists idx_ops_audit_logs_created_at
  on public.ops_audit_logs(created_at desc);
create index if not exists idx_ops_audit_logs_entity
  on public.ops_audit_logs(entity_type, entity_id);

drop trigger if exists set_ops_admin_profiles_updated_at on public.ops_admin_profiles;
create trigger set_ops_admin_profiles_updated_at
before update on public.ops_admin_profiles
for each row execute function public.ops_touch_updated_at();

drop trigger if exists set_ops_user_watchlist_updated_at on public.ops_user_watchlist;
create trigger set_ops_user_watchlist_updated_at
before update on public.ops_user_watchlist
for each row execute function public.ops_touch_updated_at();

drop trigger if exists set_ops_app_instances_updated_at on public.ops_app_instances;
create trigger set_ops_app_instances_updated_at
before update on public.ops_app_instances
for each row execute function public.ops_touch_updated_at();

drop trigger if exists set_ops_incidents_updated_at on public.ops_incidents;
create trigger set_ops_incidents_updated_at
before update on public.ops_incidents
for each row execute function public.ops_touch_updated_at();

create or replace function public.is_ops_member()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.ops_admin_profiles
    where id = auth.uid()
  );
$$;

create or replace function public.is_ops_editor()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.ops_admin_profiles
    where id = auth.uid()
      and role in ('owner', 'admin', 'operator')
  );
$$;

alter table public.ops_admin_profiles enable row level security;
alter table public.ops_user_watchlist enable row level security;
alter table public.ops_app_instances enable row level security;
alter table public.ops_heartbeats enable row level security;
alter table public.ops_incidents enable row level security;
alter table public.ops_audit_logs enable row level security;

drop policy if exists "ops_admin_profiles_read_members" on public.ops_admin_profiles;
create policy "ops_admin_profiles_read_members"
on public.ops_admin_profiles
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_admin_profiles_write_owner" on public.ops_admin_profiles;
create policy "ops_admin_profiles_write_owner"
on public.ops_admin_profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.ops_admin_profiles as admin
    where admin.id = auth.uid()
      and admin.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.ops_admin_profiles as admin
    where admin.id = auth.uid()
      and admin.role = 'owner'
  )
);

drop policy if exists "ops_user_watchlist_read_members" on public.ops_user_watchlist;
create policy "ops_user_watchlist_read_members"
on public.ops_user_watchlist
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_user_watchlist_write_editors" on public.ops_user_watchlist;
create policy "ops_user_watchlist_write_editors"
on public.ops_user_watchlist
for all
to authenticated
using (public.is_ops_editor())
with check (public.is_ops_editor());

drop policy if exists "ops_app_instances_read_members" on public.ops_app_instances;
create policy "ops_app_instances_read_members"
on public.ops_app_instances
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_app_instances_write_editors" on public.ops_app_instances;
create policy "ops_app_instances_write_editors"
on public.ops_app_instances
for all
to authenticated
using (public.is_ops_editor())
with check (public.is_ops_editor());

drop policy if exists "ops_heartbeats_read_members" on public.ops_heartbeats;
create policy "ops_heartbeats_read_members"
on public.ops_heartbeats
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_heartbeats_write_editors" on public.ops_heartbeats;
create policy "ops_heartbeats_write_editors"
on public.ops_heartbeats
for all
to authenticated
using (public.is_ops_editor())
with check (public.is_ops_editor());

drop policy if exists "ops_incidents_read_members" on public.ops_incidents;
create policy "ops_incidents_read_members"
on public.ops_incidents
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_incidents_write_editors" on public.ops_incidents;
create policy "ops_incidents_write_editors"
on public.ops_incidents
for all
to authenticated
using (public.is_ops_editor())
with check (public.is_ops_editor());

drop policy if exists "ops_audit_logs_read_members" on public.ops_audit_logs;
create policy "ops_audit_logs_read_members"
on public.ops_audit_logs
for select
to authenticated
using (public.is_ops_member());

drop policy if exists "ops_audit_logs_write_owner" on public.ops_audit_logs;
create policy "ops_audit_logs_write_owner"
on public.ops_audit_logs
for all
to authenticated
using (
  exists (
    select 1
    from public.ops_admin_profiles as admin
    where admin.id = auth.uid()
      and admin.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.ops_admin_profiles as admin
    where admin.id = auth.uid()
      and admin.role = 'owner'
  )
);
