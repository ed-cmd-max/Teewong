-- Instructor-managed public photo gallery.
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id),
  storage_path text not null unique,
  caption text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gallery_photos_published_date_idx
  on public.gallery_photos (published, created_at desc);

alter table public.gallery_photos enable row level security;
grant select on public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.gallery_photos to authenticated;

drop policy if exists "public read published gallery photos" on public.gallery_photos;
create policy "public read published gallery photos"
  on public.gallery_photos for select to anon, authenticated
  using (published = true);

drop policy if exists "instructors manage gallery photos" on public.gallery_photos;
create policy "instructors manage gallery photos"
  on public.gallery_photos for all to authenticated
  using (public.is_instructor())
  with check (public.is_instructor() and instructor_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery-photos', 'gallery-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public view gallery photos" on storage.objects;
create policy "public view gallery photos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery-photos');

drop policy if exists "instructors upload gallery photos" on storage.objects;
create policy "instructors upload gallery photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery-photos' and public.is_instructor());

drop policy if exists "instructors delete gallery photos" on storage.objects;
create policy "instructors delete gallery photos" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery-photos' and public.is_instructor());
