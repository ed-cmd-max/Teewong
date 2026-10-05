-- Taewoong virtual classroom: profiles, progress logs, and private course materials.
create type public.student_level as enum ('taekwondo_kids', 'principiantes', 'intermedios', 'avanzados');
create type public.user_role as enum ('instructor', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text not null,
  cedula text unique,
  level public.student_level,
  belt_rank text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id),
  title text not null check (length(title) between 2 and 120),
  details text not null check (length(details) between 2 and 3000),
  created_at timestamptz not null default now()
);

create table public.study_materials (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id),
  title text not null check (length(title) between 2 and 120),
  description text not null default '',
  level public.student_level,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null,
  created_at timestamptz not null default now()
);

create index progress_entries_student_date_idx on public.progress_entries(student_id, created_at desc);
create index study_materials_level_date_idx on public.study_materials(level, created_at desc);

create function public.is_instructor()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'instructor') $$;
revoke all on function public.is_instructor() from public;
grant execute on function public.is_instructor() to authenticated;

-- The trigger always creates a student profile; instructor privileges are assigned only by trusted SQL.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, cedula, level)
  values (
    new.id,
    'student',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Estudiante'),
    nullif(new.raw_user_meta_data ->> 'cedula', ''),
    case nullif(new.raw_user_meta_data ->> 'level', '')
      when 'taekwondo_kids' then 'taekwondo_kids'::public.student_level
      when 'principiantes' then 'principiantes'::public.student_level
      when 'intermedios' then 'intermedios'::public.student_level
      when 'avanzados' then 'avanzados'::public.student_level
      else null
    end
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.progress_entries enable row level security;
alter table public.study_materials enable row level security;

grant select on public.profiles to authenticated;
grant update (full_name, level, belt_rank, updated_at) on public.profiles to authenticated;
grant select on public.progress_entries to authenticated;
grant insert on public.progress_entries to authenticated;
grant select on public.study_materials to authenticated;
grant insert, delete on public.study_materials to authenticated;

create policy "instructors read all profiles" on public.profiles for select to authenticated using (public.is_instructor());
create policy "students read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "instructors update profiles" on public.profiles for update to authenticated using (public.is_instructor()) with check (public.is_instructor());
create policy "students read own progress" on public.progress_entries for select to authenticated using (student_id = (select auth.uid()));
create policy "instructors read all progress" on public.progress_entries for select to authenticated using (public.is_instructor());
create policy "instructors record progress" on public.progress_entries for insert to authenticated with check (public.is_instructor() and instructor_id = (select auth.uid()));
create policy "students read shared or level materials" on public.study_materials for select to authenticated using (
  public.is_instructor() or exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and (study_materials.level is null or p.level = study_materials.level)
  )
);
create policy "instructors publish materials" on public.study_materials for insert to authenticated with check (public.is_instructor() and instructor_id = (select auth.uid()));
create policy "instructors delete materials" on public.study_materials for delete to authenticated using (public.is_instructor());

-- Record a progress update as one transaction and keep a dated history entry.
create function public.record_student_progress(p_student_id uuid, p_level public.student_level, p_belt_rank text, p_title text, p_details text)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare entry_id uuid;
begin
  if not public.is_instructor() then raise exception 'Instructor access required'; end if;
  update public.profiles set level = p_level, belt_rank = nullif(trim(p_belt_rank), ''), updated_at = now() where id = p_student_id and role = 'student';
  if not found then raise exception 'Student not found'; end if;
  insert into public.progress_entries(student_id, instructor_id, title, details)
    values (p_student_id, (select auth.uid()), p_title, p_details) returning id into entry_id;
  return entry_id;
end;
$$;
revoke all on function public.record_student_progress(uuid, public.student_level, text, text, text) from public;
grant execute on function public.record_student_progress(uuid, public.student_level, text, text, text) to authenticated;

-- Private bucket. File paths use <level>/<random-id>_<filename>; null-level materials are shared.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', false, 52428800, array['application/pdf','image/jpeg','image/png','video/mp4','video/webm','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 52428800, allowed_mime_types = excluded.allowed_mime_types;

create policy "instructors upload study files" on storage.objects for insert to authenticated with check (
  bucket_id = 'study-materials' and public.is_instructor()
);
create policy "members read allowed study files" on storage.objects for select to authenticated using (
  bucket_id = 'study-materials' and (
    public.is_instructor() or exists (
      select 1 from public.profiles p where p.id = (select auth.uid()) and (
        (storage.foldername(name))[1] = 'all' or (storage.foldername(name))[1] = p.level::text
      )
    )
  )
);
create policy "instructors delete study files" on storage.objects for delete to authenticated using (
  bucket_id = 'study-materials' and public.is_instructor()
);

