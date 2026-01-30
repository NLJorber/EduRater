import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDays(value) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) {
    return 90;
  }
  return Math.min(Math.max(parsed, 7), 365);
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(days) {
  const now = new Date();
  const endUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const startUtc = new Date(endUtc.getTime() - (days - 1) * DAY_MS);
  const endExclusive = new Date(endUtc.getTime() + DAY_MS);

  return { startUtc, endUtc, endExclusive };
}

export async function GET(request) {
  const adminResult = await requireAdmin(request);

  if (adminResult.error) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get("days"));
  const { startUtc, endExclusive } = buildDateRange(days);

  const startIso = startUtc.toISOString();
  const endIso = endExclusive.toISOString();

  const [{ data: reviews, error: reviewsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabaseServer
        .from("reviews")
        .select("created_at")
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .is("deleted_at", null),
      supabaseServer
        .from("profiles")
        .select("created_at")
        .gte("created_at", startIso)
        .lt("created_at", endIso),
    ]);

  if (reviewsError || profilesError) {
    const message = reviewsError?.message || profilesError?.message;
    return NextResponse.json(
      { error: message || "Failed to load metrics." },
      { status: 500 }
    );
  }

  const reviewCounts = new Map();
  const userCounts = new Map();

  (reviews ?? []).forEach((row) => {
    const key = row?.created_at?.slice(0, 10);
    if (!key) {
      return;
    }
    reviewCounts.set(key, (reviewCounts.get(key) || 0) + 1);
  });

  (profiles ?? []).forEach((row) => {
    const key = row?.created_at?.slice(0, 10);
    if (!key) {
      return;
    }
    userCounts.set(key, (userCounts.get(key) || 0) + 1);
  });

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(startUtc.getTime() + i * DAY_MS);
    const key = toDateKey(date);
    series.push({
      date: key,
      reviews: reviewCounts.get(key) || 0,
      users: userCounts.get(key) || 0,
    });
  }

  return NextResponse.json({ data: series });
}
