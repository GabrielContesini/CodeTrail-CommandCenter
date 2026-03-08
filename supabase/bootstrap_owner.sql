-- Substitua pelo e-mail da conta que vai administrar o Command Center.
with target_user as (
  select
    id,
    coalesce(
      raw_user_meta_data ->> 'full_name',
      split_part(email, '@', 1),
      'CodeTrail Owner'
    ) as display_name
  from auth.users
  where email = 'gabrielct.moraes@gmail.com'
  limit 1
)
insert into public.ops_admin_profiles (id, display_name, role)
select
  id,
  display_name,
  'owner'
from target_user
on conflict (id) do update
set
  display_name = excluded.display_name,
  role = 'owner',
  updated_at = timezone('utc', now());
