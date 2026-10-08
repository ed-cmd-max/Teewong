-- Keep the rank fields distinct and record accumulated medal counts separately.
alter table public.profiles
  add column if not exists poom_dan_grade text,
  add column if not exists medals_gold integer not null default 0 check (medals_gold >= 0),
  add column if not exists medals_silver integer not null default 0 check (medals_silver >= 0),
  add column if not exists medals_bronze integer not null default 0 check (medals_bronze >= 0),
  add column if not exists instructor_signature text,
  add column if not exists athlete_signature text,
  add column if not exists guardian_signature text;

grant update (poom_dan_grade, medals_gold, medals_silver, medals_bronze,
  instructor_signature, athlete_signature, guardian_signature)
on public.profiles to authenticated;
