-- Seed subscription plans
insert into public.subscription_plans (name, slug, price_monthly, max_listings, max_favorites, features)
values
  ('Free', 'free', 0, 1, 10, array['Parcourir toutes les annonces', 'Enregistrer jusqu''à 10 favoris', 'Publier 1 annonce', 'Contacter les vendeurs', 'Recherche et filtres de base']),
  ('Pro', 'pro', 299, 5, null, array['Tout l''offre Gratuit', 'Favoris illimités', 'Jusqu''à 5 annonces', 'Support prioritaire', 'Tableau de bord analytique']),
  ('Enterprise', 'enterprise', 999, null, null, array['Tout l''offre Pro', 'Annonces illimitées', 'Gestion d''équipe', 'Accès API', 'Gestionnaire de compte dédié'])
on conflict (slug) do nothing;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-assign free plan on profile creation
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from public.subscription_plans where slug = 'free' limit 1;
  if free_plan_id is not null then
    insert into public.user_subscriptions (user_id, plan_id, status)
    values (new.id, free_plan_id, 'active')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_created_subscription on public.profiles;
create trigger on_profile_created_subscription
  after insert on public.profiles
  for each row execute function public.handle_new_user_subscription();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties
  for each row execute function public.update_updated_at();

drop trigger if exists subscription_plans_updated_at on public.subscription_plans;
create trigger subscription_plans_updated_at before update on public.subscription_plans
  for each row execute function public.update_updated_at();

drop trigger if exists user_subscriptions_updated_at on public.user_subscriptions;
create trigger user_subscriptions_updated_at before update on public.user_subscriptions
  for each row execute function public.update_updated_at();

-- Dashboard statistics for authenticated user
create or replace function public.get_dashboard_stats(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  select json_build_object(
    'listings_count', (select count(*) from public.properties where owner_id = p_user_id),
    'published_count', (select count(*) from public.properties where owner_id = p_user_id and listing_status = 'published'),
    'favorites_count', (select count(*) from public.favorites where user_id = p_user_id),
    'messages_count', (
      select count(*)
      from public.contact_inquiries ci
      inner join public.properties p on p.id = ci.property_id
      where p.owner_id = p_user_id
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_dashboard_stats(uuid) to authenticated;
