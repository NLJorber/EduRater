-- Add school_urn to schools and backfill from "School data".

alter table public.schools
  add column if not exists school_urn bigint;

create index if not exists schools_school_urn_idx
  on public.schools (school_urn);

with source as (
  select
    "URN" as urn,
    trim("EstablishmentName") as name,
    nullif(
      split_part(
        regexp_replace(lower(coalesce("SchoolWebsite", '')), '^https?://(www\\.)?', ''),
        '/',
        1
      ),
      ''
    ) as domain
  from "School data"
  where "EstablishmentName" is not null
    and trim("EstablishmentName") <> ''
),
match_by_domain as (
  select s.id, sd.urn
  from public.schools s
  join source sd
    on s.domain is not null
   and sd.domain is not null
   and lower(s.domain) = lower(sd.domain)
),
match_by_name as (
  select s.id, sd.urn
  from public.schools s
  join source sd
    on lower(s.name) = lower(sd.name)
)
update public.schools s
set school_urn = coalesce(md.urn, mn.urn)
from match_by_domain md
full join match_by_name mn on md.id = mn.id
where s.id = coalesce(md.id, mn.id)
  and s.school_urn is null;
