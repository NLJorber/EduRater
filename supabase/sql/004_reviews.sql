-- Reviews + section ratings with public read access and owner-only writes.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  overall_rating smallint,
  overall_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.review_sections (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  section_key text not null,
  rating smallint,
  comment text,
  created_at timestamptz not null default now(),
  unique (review_id, section_key),
  constraint review_sections_rating_range check (
    rating is null or (rating >= 1 and rating <= 5)
  )
);

alter table public.reviews enable row level security;
alter table public.review_sections enable row level security;

create policy "Reviews are readable by anyone"
  on public.reviews
  for select
  using (true);

create policy "Reviews are insertable by owner"
  on public.reviews
  for insert
  with check (user_id = auth.uid());

create policy "Review sections are readable by anyone"
  on public.review_sections
  for select
  using (true);

create policy "Review sections are insertable by review owner"
  on public.review_sections
  for insert
  with check (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.user_id = auth.uid()
    )
  );

-- Main school score: average of section ratings per review, then per school.
create or replace view public.school_scores as
select
  r.school_id,
  avg(section_avg) as school_score,
  count(*) as review_count
from (
  select
    r.id,
    r.school_id,
    avg(rs.rating) as section_avg
  from public.reviews r
  join public.review_sections rs on rs.review_id = r.id
  where rs.rating is not null
  group by r.id, r.school_id
) review_scores
group by school_id;
