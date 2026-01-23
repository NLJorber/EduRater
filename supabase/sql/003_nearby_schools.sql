create or replace function public.nearby_schools(
  lat double precision,
  lon double precision,
  limit_count integer default 50,
  max_km double precision default 25,
  phase_filter text default null
)
returns table (
  "URN" text,
  "Postcode" text,
  "EstablishmentName" text,
  "Locality" text,
  "Address3" text,
  "County (name)" text,
  "Town" text,
  latitude double precision,
  longitude double precision,
  "LA (name)" text,
  "Street" text,
  "SchoolWebsite" text,
  "TelephoneNum" text,
  "Gender (name)" text,
  "PhaseOfEducation (name)" text,
  "SchoolCapacity" text,
  "NumberOfPupils" text,
  "SpecialClasses (name)" text,
  distance_km double precision
)
language sql
stable
as $$
  with candidates as (
    select
      "URN"::text as "URN",
      "Postcode",
      "EstablishmentName",
      "Locality",
      "Address3",
      "County (name)",
      "Town",
      latitude::double precision as latitude,
      longitude::double precision as longitude,
      "LA (name)",
      "Street",
      "SchoolWebsite",
      "TelephoneNum",
      "Gender (name)",
      "PhaseOfEducation (name)",
      "SchoolCapacity"::text as "SchoolCapacity",
      "NumberOfPupils"::text as "NumberOfPupils",
      "SpecialClasses (name)",
      6371 * 2 * asin(
        sqrt(
          power(sin(radians((latitude::double precision - lat) / 2)), 2) +
          cos(radians(lat)) * cos(radians(latitude::double precision)) *
          power(sin(radians((longitude::double precision - lon) / 2)), 2)
        )
      ) as distance_km
    from "School data"
    where latitude is not null and longitude is not null
      and (
        phase_filter is null
        or phase_filter = ''
        or "PhaseOfEducation (name)" ilike phase_filter
      )
  )
  select *
  from candidates
  where distance_km <= max_km
  order by distance_km asc
  limit limit_count;
$$;
