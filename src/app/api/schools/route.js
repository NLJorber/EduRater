import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const urn = searchParams.get("urn");
  const postcode = searchParams.get("postcode");
  const town = searchParams.get("town");
  const street = searchParams.get("street");
  const name = searchParams.get("name");

  const q = searchParams.get("q");

  const limitParam = searchParams.get("limit");

  const limit =
    Number.isFinite(Number(limitParam)) && Number(limitParam) > 0
      ? Math.min(Number(limitParam), 200)
      : 50;

  let query = supabaseServer
    .from("School data")
    .select(
      'URN, Postcode, EstablishmentName, Town, "LA (name)", Street, SchoolWebsite, TelephoneNum, "Gender (name)", "PhaseOfEducation (name)", SchoolCapacity, NumberOfPupils, "SpecialClasses (name)"'
    )
    .limit(limit);
  
  if (q && q.trim()) {
    const term = q.trim();

    query = query.or(
      `EstablishmentName.ilike.%${term}%,Town.ilike.%${term}%,Postcode.ilike.%${term}%`
    );
  } else {
    if (urn) {
      query = query.eq("URN", urn);
    }

    if (postcode) {
      query = query.ilike("Postcode", `%${postcode}%`);
    }

    if (town) {
      query = query.ilike("Town", `%${town}%`);
    }

    if (street) {
      query = query.ilike("Street", `%${street}%`);
    }

    if (name) {
      query = query.ilike("EstablishmentName", `%${name}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
