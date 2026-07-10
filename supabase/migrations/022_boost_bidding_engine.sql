-- Atomic boost bidding engine: slot exclusivity, transactional bid placement, expiry

do $$ begin
  alter type public.notification_type add value 'boost_outbid';
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'boost_expired';
exception
  when duplicate_object then null;
end $$;

create unique index if not exists idx_boost_campaigns_one_active_per_position
  on public.boost_campaigns (product_id, position)
  where status = 'active';

create or replace function public.place_boost_bid(
  p_listing_id uuid,
  p_user_id uuid,
  p_product_id uuid,
  p_position integer,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.boost_products%rowtype;
  v_listing public.properties%rowtype;
  v_settings public.boost_settings%rowtype;
  v_incumbent public.boost_campaigns%rowtype;
  v_existing public.boost_campaigns%rowtype;
  v_minimum_bid numeric;
  v_bid_increment numeric;
  v_campaign_id uuid;
  v_starts_at timestamptz := now();
  v_expires_at timestamptz;
  v_outbid_user_id uuid := null;
  v_outbid_listing_id uuid := null;
  v_outbid_campaign_id uuid := null;
  v_has_incumbent boolean := false;
begin
  if p_position < 1 then
    return jsonb_build_object('error', 'Invalid position.');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_product_id::text || ':' || p_position::text, 0)
  );

  select * into v_product
  from public.boost_products
  where id = p_product_id
    and is_active = true;

  if not found then
    return jsonb_build_object('error', 'Boost product not found or inactive.');
  end if;

  select * into v_listing
  from public.properties
  where id = p_listing_id;

  if not found then
    return jsonb_build_object('error', 'Listing not found.');
  end if;

  if v_listing.owner_id <> p_user_id then
    return jsonb_build_object('error', 'You do not own this listing.');
  end if;

  select * into v_settings
  from public.boost_settings
  where id = 1;

  v_bid_increment := coalesce(v_settings.bid_increment, 10);

  select * into v_existing
  from public.boost_campaigns
  where listing_id = p_listing_id
    and product_id = p_product_id
    and status in ('pending', 'active')
  order by created_at desc
  limit 1;

  if found then
    if v_existing.status = 'active' and v_existing.expires_at is not null and v_existing.expires_at > now() then
      if v_existing.position = p_position and v_existing.listing_id = p_listing_id then
        return jsonb_build_object('error', 'Your listing already holds this position.');
      end if;
      return jsonb_build_object('error', 'This listing already has an active boost campaign.');
    end if;

    if v_existing.status = 'pending' then
      update public.boost_campaigns
      set status = 'cancelled'
      where id = v_existing.id;
    end if;
  end if;

  select * into v_incumbent
  from public.boost_campaigns
  where product_id = p_product_id
    and position = p_position
    and status = 'active'
    and expires_at is not null
    and expires_at > now()
  order by amount desc, created_at asc
  limit 1
  for update;

  v_has_incumbent := found;

  if v_has_incumbent then
    if v_incumbent.listing_id = p_listing_id then
      return jsonb_build_object('error', 'Your listing already holds this position.');
    end if;
    v_minimum_bid := v_incumbent.amount + v_bid_increment;
  else
    v_minimum_bid := v_product.default_price;
  end if;

  if p_amount < v_minimum_bid then
    return jsonb_build_object(
      'error', 'This position has just been updated. Please refresh and try again.',
      'code', 'stale_bid'
    );
  end if;

  v_expires_at := v_starts_at + make_interval(days => v_product.default_duration);

  insert into public.boost_campaigns (
    listing_id,
    user_id,
    product_id,
    position,
    amount,
    status
  )
  values (
    p_listing_id,
    p_user_id,
    p_product_id,
    p_position,
    p_amount,
    'pending'
  )
  returning id into v_campaign_id;

  insert into public.boost_history (campaign_id, action, amount, new_position)
  values (v_campaign_id, 'created', p_amount, p_position);

  if v_has_incumbent then
    v_outbid_user_id := v_incumbent.user_id;
    v_outbid_listing_id := v_incumbent.listing_id;
    v_outbid_campaign_id := v_incumbent.id;

    update public.boost_campaigns
    set status = 'removed'
    where id = v_incumbent.id;

    insert into public.boost_history (campaign_id, action, amount, previous_position)
    values (v_incumbent.id, 'outbid', v_incumbent.amount, v_incumbent.position);

    if v_product.type = 'homepage_spotlight' then
      update public.properties
      set is_featured = false
      where id = v_incumbent.listing_id;
    end if;
  end if;

  update public.boost_campaigns
  set
    status = 'active',
    starts_at = v_starts_at,
    expires_at = v_expires_at
  where id = v_campaign_id;

  insert into public.boost_history (campaign_id, action, amount, new_position)
  values (v_campaign_id, 'activated', p_amount, p_position);

  if v_product.type = 'homepage_spotlight' then
    update public.properties
    set is_featured = true
    where id = p_listing_id;
  end if;

  return jsonb_build_object(
    'campaign_id', v_campaign_id,
    'outbid_user_id', v_outbid_user_id,
    'outbid_listing_id', v_outbid_listing_id,
    'outbid_campaign_id', v_outbid_campaign_id,
    'winning_amount', p_amount,
    'position', p_position
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'error', 'This position has just been updated. Please refresh and try again.',
      'code', 'concurrency_conflict'
    );
end;
$$;

create or replace function public.expire_due_boost_campaigns()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.boost_campaigns%rowtype;
  v_product public.boost_products%rowtype;
  v_count integer := 0;
begin
  for v_row in
    select *
    from public.boost_campaigns
    where status = 'active'
      and expires_at is not null
      and expires_at <= now()
    for update
  loop
    select * into v_product
    from public.boost_products
    where id = v_row.product_id;

    update public.boost_campaigns
    set status = 'expired'
    where id = v_row.id;

    insert into public.boost_history (campaign_id, action, amount, previous_position)
    values (v_row.id, 'expired', v_row.amount, v_row.position);

    if v_product.type = 'homepage_spotlight' then
      update public.properties
      set is_featured = false
      where id = v_row.listing_id;
    end if;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.admin_force_assign_boost(
  p_listing_id uuid,
  p_product_id uuid,
  p_position integer,
  p_amount numeric,
  p_admin_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.boost_products%rowtype;
  v_listing public.properties%rowtype;
  v_incumbent public.boost_campaigns%rowtype;
  v_campaign_id uuid;
  v_starts_at timestamptz := now();
  v_expires_at timestamptz;
  v_has_incumbent boolean := false;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'Unauthorized.');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_product_id::text || ':' || p_position::text, 0)
  );

  select * into v_product
  from public.boost_products
  where id = p_product_id;

  if not found then
    return jsonb_build_object('error', 'Boost product not found.');
  end if;

  select * into v_listing
  from public.properties
  where id = p_listing_id;

  if not found then
    return jsonb_build_object('error', 'Listing not found.');
  end if;

  select * into v_incumbent
  from public.boost_campaigns
  where product_id = p_product_id
    and position = p_position
    and status = 'active'
    and expires_at is not null
    and expires_at > now()
  limit 1
  for update;

  v_has_incumbent := found;

  if v_has_incumbent then
    update public.boost_campaigns
    set status = 'removed'
    where id = v_incumbent.id;

    insert into public.boost_history (campaign_id, action, amount, previous_position)
    values (v_incumbent.id, 'removed', v_incumbent.amount, v_incumbent.position);

    if v_product.type = 'homepage_spotlight' then
      update public.properties
      set is_featured = false
      where id = v_incumbent.listing_id;
    end if;
  end if;

  update public.boost_campaigns
  set status = 'cancelled'
  where listing_id = p_listing_id
    and product_id = p_product_id
    and status in ('pending', 'active');

  v_expires_at := v_starts_at + make_interval(days => v_product.default_duration);

  insert into public.boost_campaigns (
    listing_id,
    user_id,
    product_id,
    position,
    amount,
    status,
    starts_at,
    expires_at
  )
  values (
    p_listing_id,
    v_listing.owner_id,
    p_product_id,
    p_position,
    p_amount,
    'active',
    v_starts_at,
    v_expires_at
  )
  returning id into v_campaign_id;

  insert into public.boost_history (campaign_id, action, amount, new_position)
  values (v_campaign_id, 'activated', p_amount, p_position);

  if v_product.type = 'homepage_spotlight' then
    update public.properties
    set is_featured = true
    where id = p_listing_id;
  end if;

  return jsonb_build_object('campaign_id', v_campaign_id);
exception
  when unique_violation then
    return jsonb_build_object(
      'error', 'This position has just been updated. Please refresh and try again.',
      'code', 'concurrency_conflict'
    );
end;
$$;

revoke all on function public.place_boost_bid(uuid, uuid, uuid, integer, numeric) from public;
grant execute on function public.place_boost_bid(uuid, uuid, uuid, integer, numeric) to authenticated;

revoke all on function public.expire_due_boost_campaigns() from public;
grant execute on function public.expire_due_boost_campaigns() to authenticated;

revoke all on function public.admin_force_assign_boost(uuid, uuid, integer, numeric, uuid) from public;
grant execute on function public.admin_force_assign_boost(uuid, uuid, integer, numeric, uuid) to authenticated;
