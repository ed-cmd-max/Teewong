-- Private identity documents and instructor-managed monthly payment receipts.
alter table public.profiles
  add column if not exists cedula_document_path text;

grant update (cedula_document_path) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-documents', 'student-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "instructors upload student identity documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'student-documents' and public.is_instructor());
create policy "instructors read student identity documents" on storage.objects
  for select to authenticated using (bucket_id = 'student-documents' and public.is_instructor());
create policy "instructors delete student identity documents" on storage.objects
  for delete to authenticated using (bucket_id = 'student-documents' and public.is_instructor());

create table public.student_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id),
  due_date date not null,
  payment_date date not null default current_date,
  amount numeric(8,2) not null check (amount > 0),
  method text not null default 'efectivo' check (method in ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, due_date)
);

create index student_payments_student_date_idx
  on public.student_payments (student_id, payment_date desc);
alter table public.student_payments enable row level security;
grant select, insert on public.student_payments to authenticated;

create policy "instructors manage student payments" on public.student_payments
  for all to authenticated
  using (public.is_instructor())
  with check (public.is_instructor() and instructor_id = (select auth.uid()));
create policy "students read own payment receipts" on public.student_payments
  for select to authenticated
  using (student_id = (select auth.uid()));
