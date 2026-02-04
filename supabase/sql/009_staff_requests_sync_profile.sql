-- Sync staff_requests approval status to profiles.role.

create or replace function public.sync_staff_request_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  if new.status = 'approved' then
    update public.profiles
      set role = 'staff_verified',
          school_id = new.school_id
    where id = new.user_id;
  elsif new.status = 'rejected' then
    update public.profiles
      set role = 'user',
          school_id = null
    where id = new.user_id
      and role = 'staff_pending';
  end if;

  return new;
end;
$$;

drop trigger if exists staff_requests_sync_profile on public.staff_requests;
create trigger staff_requests_sync_profile
after insert or update of status, school_id on public.staff_requests
for each row
execute function public.sync_staff_request_to_profile();
