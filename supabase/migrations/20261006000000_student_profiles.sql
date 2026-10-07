-- Extend the member profile with the information needed for an instructor-managed student record.
alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists guardian_name text,
  add column if not exists guardian_phone text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists branch text check (branch is null or branch in ('el_condado', 'pomasqui')),
  add column if not exists profile_photo_path text;

grant update (full_name, level, belt_rank, date_of_birth, phone, guardian_name, guardian_phone,
  emergency_contact_name, emergency_contact_phone, branch, profile_photo_path, updated_at)
on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-photos', 'student-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

create policy "instructors upload student photos" on storage.objects for insert to authenticated with check (
  bucket_id = 'student-photos' and public.is_instructor()
);
create policy "members read own student photo and instructors read all" on storage.objects for select to authenticated using (
  bucket_id = 'student-photos' and (
    public.is_instructor() or (storage.foldername(name))[1] = (select auth.uid())::text
  )
);
create policy "instructors delete student photos" on storage.objects for delete to authenticated using (
  bucket_id = 'student-photos' and public.is_instructor()
);
