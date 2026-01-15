-- create the reviews table with RLS policies
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  -- link to the signed-in user who wrote the review
  user_id uuid not null references auth.users (id) on delete cascade,

  -- link to the school being reviewed using URN
  school_urn bigint not null references public."School data"("URN") on delete restrict,

  -- decimal rating between 0 and 5
  rating numeric(3,1) not null check (rating >= 0 and rating <= 5),

  title text,
  body text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- indexes to speed up lookups
create index if not exists reviews_school_urn_idx on public.reviews (school_urn);
create index if not exists reviews_user_id_idx on public.reviews (user_id);

-- auto-update updated_at on any update
drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- policies for reviews table giving rules for who can do what

-- anyone can read reviews that aren't soft deleted
drop policy if exists "Reviews are readable by anyone" on public.reviews;
create policy "Reviews are readable by anyone"
  on public.reviews
  for select
  using (deleted_at is null);

-- logged-in users can insert reviews, but only as themselves
drop policy if exists "Users can create their own reviews" on public.reviews;
create policy "Users can create their own reviews"
  on public.reviews
  for insert
  with check (user_id = auth.uid());

-- logged-in users can update their own reviews
drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews"
  on public.reviews
  for update
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());