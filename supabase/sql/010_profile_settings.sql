-- Profile settings with avatar selection (locked to allowed DiceBear seeds).

do $$
begin
  create type public.avatar_style as enum (
    'avataaars-neutral'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.avatar_seed as enum (
    'Felix',
    'Luna',
    'Milo',
    'Zoe',
    'Nova',
    'Aria',
    'Leo',
    'Kai',
    'Ivy',
    'Ezra',
    'Mira',
    'Theo'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profile_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  avatar_style public.avatar_style not null default 'avataaars-neutral',
  avatar_seed public.avatar_seed not null default 'Felix',
  display_name text not null default 'User',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profile_settings_updated_at on public.profile_settings;
create trigger set_profile_settings_updated_at
before update on public.profile_settings
for each row execute function public.set_updated_at();

alter table public.profile_settings enable row level security;

create policy "Profile settings are viewable by owners"
  on public.profile_settings
  for select
  using (user_id = auth.uid());

create policy "Profile settings are viewable by anyone"
  on public.profile_settings
  for select
  using (true);

create policy "Profile settings are insertable by owners"
  on public.profile_settings
  for insert
  with check (user_id = auth.uid());

create policy "Profile settings are updatable by owners"
  on public.profile_settings
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
