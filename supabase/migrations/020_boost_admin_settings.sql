-- Boost admin settings + extended history actions

alter type public.boost_history_action add value if not exists 'extended';
alter type public.boost_history_action add value if not exists 'disabled';

create table if not exists public.boost_settings (
  id smallint primary key default 1 check (id = 1),
  bid_increment numeric not null default 10 check (bid_increment > 0),
  featured_positions integer not null default 5 check (featured_positions between 1 and 20),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.boost_settings (id, bid_increment, featured_positions)
values (1, 10, 5)
on conflict (id) do nothing;

alter table public.boost_settings enable row level security;

drop policy if exists "Authenticated users can read boost settings" on public.boost_settings;
create policy "Authenticated users can read boost settings"
  on public.boost_settings
  for select
  to authenticated
  using (true);

drop policy if exists "Admins manage boost settings" on public.boost_settings;
create policy "Admins manage boost settings"
  on public.boost_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_boost_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists boost_settings_updated_at on public.boost_settings;
create trigger boost_settings_updated_at
  before update on public.boost_settings
  for each row
  execute function public.touch_boost_settings_updated_at();
