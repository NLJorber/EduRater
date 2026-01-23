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
  const phaseParam = searchParams.get("phase");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const limitParam = searchParams.get("limit");
  const radiusParam = searchParams.get("radiusKm");

  const limit =
    Number.isFinite(Number(limitParam)) && Number(limitParam) > 0
      ? Math.min(Number(limitParam), 200)
      : 50;

  const radiusKm =
    Number.isFinite(Number(radiusParam)) && Number(radiusParam) > 0
      ? Math.min(Number(radiusParam), 200)
      : 25;

  const makeBaseQuery = () =>
    supabaseServer
      .from("School data")
      .select(
        'URN, Postcode, EstablishmentName, Locality, Address3, "County (name)", Town, latitude, longitude, "LA (name)", Street, SchoolWebsite, TelephoneNum, "Gender (name)", "PhaseOfEducation (name)", "EstablishmentStatus (name)",SchoolCapacity, NumberOfPupils, "SpecialClasses (name)", SchoolWebsite'
      )
      .limit(limit);

  const hasCoords =
    latParam != null &&
    lngParam != null &&
    `${latParam}`.trim() !== "" &&
    `${lngParam}`.trim() !== "" &&
    Number.isFinite(Number(latParam)) &&
    Number.isFinite(Number(lngParam));

  const looksLikePostcode = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return false;
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(trimmed);
  };

  const fetchPostcodesIo = async (url) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || body.status !== 200 || !body.result) return null;
    return body.result;
  };

  const resolveLocation = async (term) => {
    const trimmed = (term || "").trim();
    if (!trimmed) return null;

    const hasDigit = /\d/.test(trimmed);
    const base = "https://api.postcodes.io";

    if (hasDigit) {
      const postcode = await fetchPostcodesIo(
        `${base}/postcodes/${encodeURIComponent(trimmed)}`
      );
      if (postcode?.latitude && postcode?.longitude) {
        return { lat: postcode.latitude, lng: postcode.longitude };
      }

      const postcodeMatch = await fetchPostcodesIo(
        `${base}/postcodes?q=${encodeURIComponent(trimmed)}&limit=1`
      );
      if (Array.isArray(postcodeMatch) && postcodeMatch[0]) {
        const hit = postcodeMatch[0];
        if (hit.latitude && hit.longitude) {
          return { lat: hit.latitude, lng: hit.longitude };
        }
      }
    }

    const placeMatch = await fetchPostcodesIo(
      `${base}/places?q=${encodeURIComponent(trimmed)}&limit=1`
    );
    if (Array.isArray(placeMatch) && placeMatch[0]) {
      const hit = placeMatch[0];
      if (hit.latitude && hit.longitude) {
        return { lat: hit.latitude, lng: hit.longitude };
      }
    }

    return null;
  };

  const runNearbySearch = async (lat, lng) => {
    const { data, error } = await supabaseServer.rpc("nearby_schools", {
      lat: Number(lat),
      lon: Number(lng),
      limit_count: limit,
      max_km: radiusKm,
      phase_filter: phasePattern,
    });

    if (error) {
      return { error: error.message };
    }

    return { data };
  };

  const getStatusRank = (row) => {
    const raw = `${row?.['EstablishmentStatus (name)'] || ""}`.trim();
    if (!raw) return 1;
    return /open/i.test(raw) ? 0 : 1;
  };

  const dedupeByNameAndPostcode = (rows) => {
    const out = [];
    const indexByKey = new Map();

    for (const row of rows || []) {
      const name = (row?.EstablishmentName || "").trim().toLowerCase();
      const postcodeKey = (row?.Postcode || "")
        .replace(/\s+/g, "")
        .toLowerCase();
      const key = postcodeKey || name;

      if (!name) continue;

      const existingIndex = indexByKey.get(key);
      if (existingIndex == null) {
        indexByKey.set(key, out.length);
        out.push(row);
        continue;
      }

      const existing = out[existingIndex];
      if (getStatusRank(row) < getStatusRank(existing)) {
        out[existingIndex] = row;
      }
    }

    return out;
  };

  const excludeHigherEd = (rows) =>
    Array.isArray(rows)
      ? rows.filter((row) => {
          const name = `${row?.EstablishmentName || ""}`.toLowerCase();
          return !name.includes("university") && !name.includes("college");
        })
      : rows;

  const normalizedPhase = (phaseParam || "").trim().toLowerCase();
  const phasePattern = (() => {
    if (!normalizedPhase || normalizedPhase === "all") return null;
    if (normalizedPhase === "primary") return "%Primary%";
    if (normalizedPhase === "secondary") return "%Secondary%";
    if (normalizedPhase === "nursery") return "%Nursery%";
    if (normalizedPhase === "not applicable") return "%Not applicable%";
    return `%${normalizedPhase}%`;
  })();
  
  if (hasCoords) {
    const nearby = await runNearbySearch(latParam, lngParam);
    if (nearby.error) {
      return NextResponse.json({ error: nearby.error }, { status: 500 });
    }
    return NextResponse.json({
      data: excludeHigherEd(nearby.data),
      mode: "nearby",
    });
  }

  if (q && q.trim()) {
    const term = q.trim();
    const postcodeQuery = looksLikePostcode(term);

    if (postcodeQuery) {
      const coords = await resolveLocation(term);
      if (coords) {
        const nearby = await runNearbySearch(coords.lat, coords.lng);
        if (nearby.error) {
          return NextResponse.json({ error: nearby.error }, { status: 500 });
        }
        return NextResponse.json({
          data: excludeHigherEd(dedupeByNameAndPostcode(nearby.data)),
          mode: "nearby",
          location: coords,
        });
      }
    }

    let query = makeBaseQuery().or(
      `EstablishmentName.ilike.%${term}%,Town.ilike.%${term}%,Postcode.ilike.%${term}%`
    );
    if (phasePattern) {
      query = query.ilike('"PhaseOfEducation (name)"', phasePattern);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        data: excludeHigherEd(dedupeByNameAndPostcode(data)),
        mode: "text",
      });
    }

    const coords = await resolveLocation(term);
    if (coords) {
      const nearby = await runNearbySearch(coords.lat, coords.lng);
      if (nearby.error) {
        return NextResponse.json({ error: nearby.error }, { status: 500 });
      }
      return NextResponse.json({
        data: excludeHigherEd(dedupeByNameAndPostcode(nearby.data)),
        mode: "nearby",
        location: coords,
      });
    }

    return NextResponse.json({ data: [] });
  } else {
    let query = makeBaseQuery();

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
    if (phasePattern) {
      query = query.ilike('"PhaseOfEducation (name)"', phasePattern);
    }
    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: excludeHigherEd(dedupeByNameAndPostcode(data)),
    });
  }
}
