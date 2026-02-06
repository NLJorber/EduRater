-- Ensure profile_settings row is created on signup with display name.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_domain text;
  matching_school_id uuid;
  display_name text;
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

  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'User'
  );

  insert into public.profile_settings (user_id, display_name)
  values (new.id, display_name)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Backfill profile_settings for any existing users missing a row.
insert into public.profile_settings (user_id, display_name)
select u.id,
       coalesce(
         nullif(u.raw_user_meta_data->>'display_name', ''),
         nullif(u.raw_user_meta_data->>'full_name', ''),
         nullif(u.raw_user_meta_data->>'name', ''),
         nullif(split_part(u.email, '@', 1), ''),
         'User'
       )
from auth.users u
left join public.profile_settings ps on ps.user_id = u.id
where ps.user_id is null;
