-- Supabase auth schema, roles, and policies for EduRater.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum (
    'super_admin',
    'user',
    'staff_pending',
    'staff_verified'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.staff_request_status as enum (
    'pending',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  created_at timestamptz not null default now()
);

create unique index if not exists schools_domain_unique
  on public.schools (lower(domain))
  where domain is not null;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  school_id uuid references public.schools (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_id uuid not null references public.schools (id),
  status public.staff_request_status not null default 'pending',
  evidence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, school_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_staff_requests_updated_at on public.staff_requests;
create trigger set_staff_requests_updated_at
before update on public.staff_requests
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_domain text;
  matching_school_id uuid;
begin
  email_domain := split_part(new.email, '@', 2);

  if email_domain is not null and length(email_domain) > 0 then
    select id
      into matching_school_id
    from public.schools
    where lower(domain) = lower(email_domain)
    limit 1;
  end if;

  insert into public.profiles (id, role, school_id)
  values (
    new.id,
    case
      when matching_school_id is not null then 'staff_verified'
      else 'user'
    end,
    matching_school_id
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.staff_requests enable row level security;
alter table public.schools enable row level security;

create policy "Profiles are viewable by owners"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "Profiles are viewable by super admins"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  );

create policy "Profiles are updatable by super admins"
  on public.profiles
  for update
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  );

create policy "Staff requests are insertable by owners"
  on public.staff_requests
  for insert
  with check (user_id = auth.uid());

create policy "Staff requests are viewable by owners"
  on public.staff_requests
  for select
  using (user_id = auth.uid());

create policy "Staff requests are viewable by super admins"
  on public.staff_requests
  for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  );

create policy "Staff requests are updatable by super admins"
  on public.staff_requests
  for update
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  );

create policy "Schools are readable by anyone"
  on public.schools
  for select
  using (true);

create policy "Schools are manageable by super admins"
  on public.schools
  for all
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'super_admin'
    )
  );
