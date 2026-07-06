-- Property images storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS policies
drop policy if exists "Property images are publicly accessible" on storage.objects;
create policy "Property images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own property images" on storage.objects;
create policy "Users can update own property images"
  on storage.objects for update
  using (
    bucket_id = 'property-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own property images" on storage.objects;
create policy "Users can delete own property images"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
