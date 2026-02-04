import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

function clampDays(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return 90;
  }
  return Math.min(Math.max(parsed, 7), 365);
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function createDateSeries(startUtc, endUtc) {
  const series = [];
  const cursor = new Date(startUtc);
  while (cursor <= endUtc) {
    series.push({
      date: toDateKey(cursor),
      avg_score: null,
      review_count: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

function computeDailyAverages(reviews, startUtc, endUtc) {
  const buckets = new Map();

  reviews.forEach((review) => {
    const rating =
      typeof review.rating_computed === "number"
        ? review.rating_computed
        : typeof review.rating === "number"
        ? review.rating
        : null;

    if (rating === null) {
      return;
    }

    const createdAt = new Date(review.created_at);
    const key = toDateKey(createdAt);
    const bucket = buckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += rating;
    bucket.count += 1;
    buckets.set(key, bucket);
  });

  const series = createDateSeries(startUtc, endUtc).map((row) => {
    const bucket = buckets.get(row.date);
    if (!bucket) {
      return row;
    }
    return {
      ...row,
      avg_score: bucket.count ? bucket.sum / bucket.count : null,
      review_count: bucket.count,
    };
  });

  return series;
}

function computeSectionAverages(sectionRows) {
  const buckets = new Map();

  sectionRows.forEach((row) => {
    if (typeof row.rating !== "number") {
      return;
    }
    const bucket = buckets.get(row.section_key) ?? { sum: 0, count: 0 };
    bucket.sum += row.rating;
    bucket.count += 1;
    buckets.set(row.section_key, bucket);
  });

  return Array.from(buckets.entries())
    .map(([section_key, bucket]) => ({
      section_key,
      avg_rating: bucket.count ? bucket.sum / bucket.count : null,
      count: bucket.count,
    }))
    .filter((row) => row.avg_rating !== null)
    .sort((a, b) => b.avg_rating - a.avg_rating);
}

export async function GET(request) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = clampDays(searchParams.get("days"));

  const supabaseUser = createUserClient(token);
  const { data: profile, error: profileError } = await supabaseUser
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile?.school_id) {
    return NextResponse.json(
      { error: "No school linked to this account." },
      { status: 400 }
    );
  }

  const { data: school, error: schoolError } = await supabaseServer
    .from("schools")
    .select("id, name, school_urn")
    .eq("id", profile.school_id)
    .maybeSingle();

  if (schoolError) {
    return NextResponse.json({ error: schoolError.message }, { status: 500 });
  }

  if (!school?.school_urn) {
    return NextResponse.json(
      { error: "School is missing a URN." },
      { status: 400 }
    );
  }

  const endUtc = new Date();
  endUtc.setUTCHours(0, 0, 0, 0);
  const startUtc = new Date(endUtc);
  startUtc.setUTCDate(startUtc.getUTCDate() - (days - 1));

  const { data: reviews, error: reviewsError } = await supabaseServer
    .from("reviews")
    .select("rating_computed, rating, created_at")
    .eq("school_urn", school.school_urn)
    .is("deleted_at", null)
    .gte("created_at", startUtc.toISOString())
    .lte("created_at", new Date(endUtc.getTime() + 86400000).toISOString());

  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  }

  const dailySeries = computeDailyAverages(
    reviews ?? [],
    startUtc,
    endUtc
  );

  const { data: reviewIds, error: reviewIdsError } = await supabaseServer
    .from("reviews")
    .select("id")
    .eq("school_urn", school.school_urn)
    .is("deleted_at", null);

  if (reviewIdsError) {
    return NextResponse.json({ error: reviewIdsError.message }, { status: 500 });
  }

  const ids = (reviewIds ?? []).map((row) => row.id).filter(Boolean);

  let sectionAverages = [];
  if (ids.length > 0) {
    const { data: sections, error: sectionsError } = await supabaseServer
      .from("review_sections")
      .select("section_key, rating")
      .in("review_id", ids);

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }

    sectionAverages = computeSectionAverages(sections ?? []);
  }

  return NextResponse.json({
    data: {
      school: {
        id: school.id,
        name: school.name,
        school_urn: school.school_urn,
      },
      days,
      dailySeries,
      sectionAverages,
    },
  });
}
