-- Dated physical performance controls for each Taewoong student.
create table if not exists public.student_measurements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id),
  measurement_date date not null default current_date,
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg >= 0),
  abdomen_cm numeric(5, 2) check (abdomen_cm is null or abdomen_cm >= 0),
  speed_20m_seconds numeric(6, 2) check (speed_20m_seconds is null or speed_20m_seconds >= 0),
  abdominal_reps_1min integer check (abdominal_reps_1min is null or abdominal_reps_1min >= 0),
  flexibility_cm numeric(5, 2) check (flexibility_cm is null or flexibility_cm >= 0),
  endurance_6min_m integer check (endurance_6min_m is null or endurance_6min_m >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_measurements_student_date_idx
  on public.student_measurements (student_id, measurement_date desc);

alter table public.student_measurements enable row level security;

drop policy if exists "instructors manage student measurements" on public.student_measurements;
create policy "instructors manage student measurements"
  on public.student_measurements for all to authenticated
  using (public.is_instructor())
  with check (
    public.is_instructor()
    and instructor_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = student_id and p.role = 'student')
  );

drop policy if exists "students read own measurements" on public.student_measurements;
create policy "students read own measurements"
  on public.student_measurements for select to authenticated
  using (student_id = (select auth.uid()));

grant select, insert, update, delete on public.student_measurements to authenticated;
