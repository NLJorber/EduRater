-- Allow admins to edit reviews and their section rows.

drop policy if exists "Reviews are updatable by admins" on public.reviews;
create policy "Reviews are updatable by admins"
  on public.reviews
  for update
  using (
    deleted_at is null
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  )
  with check (
    deleted_at is null
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Review sections are insertable by admins" on public.review_sections;
create policy "Review sections are insertable by admins"
  on public.review_sections
  for insert
  with check (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.deleted_at is null
    )
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Review sections are updatable by admins" on public.review_sections;
create policy "Review sections are updatable by admins"
  on public.review_sections
  for update
  using (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.deleted_at is null
    )
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  )
  with check (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.deleted_at is null
    )
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Review sections are deletable by admins" on public.review_sections;
create policy "Review sections are deletable by admins"
  on public.review_sections
  for delete
  using (
    exists (
      select 1
      from public.reviews r
      where r.id = review_id
        and r.deleted_at is null
    )
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'super_admin'
      )
      or exists (
        select 1
        from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
  );
