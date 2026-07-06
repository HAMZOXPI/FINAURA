-- Admin write access for property moderation (uses is_admin() from 013)

drop policy if exists "Admins can update all properties" on public.properties;
create policy "Admins can update all properties"
  on public.properties
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete all properties" on public.properties;
create policy "Admins can delete all properties"
  on public.properties
  for delete
  using (public.is_admin());
