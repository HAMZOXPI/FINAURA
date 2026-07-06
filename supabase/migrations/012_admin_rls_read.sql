-- Admin read access for platform statistics (role already exists on profiles)

drop policy if exists "Admins can read all properties" on public.properties;
create policy "Admins can read all properties"
  on public.properties for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can read all subscriptions" on public.user_subscriptions;
create policy "Admins can read all subscriptions"
  on public.user_subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can read all messages" on public.messages;
create policy "Admins can read all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can read all conversations" on public.conversations;
create policy "Admins can read all conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
