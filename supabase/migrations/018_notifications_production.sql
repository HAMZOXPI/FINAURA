-- Notification module production enhancements

do $$ begin
  alter type public.notification_type add value 'gift_expired';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'premium_expiring';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'subscription_renewed';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'subscription_expired';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_audience add value 'city_users';
exception when duplicate_object then null;
end $$;

alter table public.notification_broadcasts
  add column if not exists target_city text;

create index if not exists idx_notifications_dedup
  on public.notifications (user_id, notification_type, ((metadata->>'dedup_key')))
  where (metadata->>'dedup_key') is not null;

create or replace function public.create_user_notification(
  p_user_id uuid,
  p_notification_type public.notification_type,
  p_priority public.notification_priority,
  p_title text,
  p_body text,
  p_action_url text default null,
  p_template_key text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_broadcast_id uuid default null,
  p_dedup_key text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_meta jsonb;
begin
  v_meta := coalesce(p_metadata, '{}'::jsonb);

  if p_dedup_key is not null then
    select n.id into v_id
    from public.notifications n
    where n.user_id = p_user_id
      and n.notification_type = p_notification_type
      and n.metadata->>'dedup_key' = p_dedup_key
      and n.created_at > now() - interval '24 hours'
    order by n.created_at desc
    limit 1;

    if v_id is not null then
      return v_id;
    end if;

    v_meta := v_meta || jsonb_build_object('dedup_key', p_dedup_key);
  end if;

  insert into public.notifications (
    user_id,
    notification_type,
    priority,
    title,
    body,
    action_url,
    template_key,
    metadata,
    broadcast_id
  ) values (
    p_user_id,
    p_notification_type,
    p_priority,
    p_title,
    p_body,
    p_action_url,
    p_template_key,
    v_meta,
    p_broadcast_id
  )
  returning id into v_id;

  insert into public.notification_audit_log (action, notification_id, user_id, metadata)
  values ('create', v_id, p_user_id, v_meta);

  return v_id;
end;
$$;

grant execute on function public.create_user_notification to authenticated;
grant execute on function public.create_user_notification to service_role;

create or replace function public.cleanup_old_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.notifications
  where is_read = true
    and created_at < now() - interval '1 year';

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

grant execute on function public.cleanup_old_notifications to service_role;
