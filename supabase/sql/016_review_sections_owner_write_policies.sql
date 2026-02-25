-- Allow review owners to edit and replace section rows on review update.

drop policy if exists "Review sections are updatable by review owner" on public.review_sections;
create policy "Review sections are updatable by review owner"
  on public.review_sections
  for update
  using (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.user_id = auth.uid()
        and r.deleted_at is null
    )
  )
  with check (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.user_id = auth.uid()
        and r.deleted_at is null
    )
  );

drop policy if exists "Review sections are deletable by review owner" on public.review_sections;
create policy "Review sections are deletable by review owner"
  on public.review_sections
  for delete
  using (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.user_id = auth.uid()
        and r.deleted_at is null
    )
  );
