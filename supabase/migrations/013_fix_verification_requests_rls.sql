-- Fix infinite recursion in verification_requests RLS policies.
--
-- Root cause: the INSERT policy queried verification_requests from within
-- its own WITH CHECK clause, which re-triggered RLS on the same table.
--
-- One-pending-per-seller is already enforced by:
--   idx_verification_requests_one_pending (unique partial index)

-- Helper: admin check without self-referential policy subqueries
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Drop broken policies from 011_verification_requests.sql
drop policy if exists "Sellers can view own verification requests" on public.verification_requests;
drop policy if exists "Sellers can submit verification requests" on public.verification_requests;
drop policy if exists "Admins can update verification requests" on public.verification_requests;

-- Sellers: read own requests only
create policy "Sellers read own verification requests"
  on public.verification_requests
  for select
  using (auth.uid() = seller_id);

-- Admins: read all requests
create policy "Admins read all verification requests"
  on public.verification_requests
  for select
  using (public.is_admin());

-- Sellers: insert own pending request (no self-select on verification_requests)
create policy "Sellers insert own verification requests"
  on public.verification_requests
  for insert
  with check (
    auth.uid() = seller_id
    and status = 'pending'
    and not coalesce(
      (select p.is_verified from public.profiles p where p.id = auth.uid()),
      false
    )
  );

-- Admins: update status (approve / reject)
create policy "Admins update verification requests"
  on public.verification_requests
  for update
  using (public.is_admin())
  with check (public.is_admin());
