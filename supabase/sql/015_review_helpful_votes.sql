create table if not exists public.review_helpful_votes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists review_helpful_votes_review_id_idx
  on public.review_helpful_votes (review_id);

create index if not exists review_helpful_votes_user_id_idx
  on public.review_helpful_votes (user_id);

alter table public.review_helpful_votes enable row level security;

drop policy if exists "Helpful votes are readable by anyone" on public.review_helpful_votes;
create policy "Helpful votes are readable by anyone"
  on public.review_helpful_votes
  for select
  using (true);

drop policy if exists "Users can add their own helpful votes" on public.review_helpful_votes;
create policy "Users can add their own helpful votes"
  on public.review_helpful_votes
  for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can remove their own helpful votes" on public.review_helpful_votes;
create policy "Users can remove their own helpful votes"
  on public.review_helpful_votes
  for delete
  using (user_id = auth.uid());
