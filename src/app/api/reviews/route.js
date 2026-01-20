import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

import { reviewIsClean } from "@/lib/moderation/bannedWords";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const schoolUrn = searchParams.get("school_urn") ?? searchParams.get("schoolUrn");

  if (!schoolUrn) {
    return NextResponse.json(
      { error: "Missing school_urn." },
      { status: 400 }
    );
  }

  let reviewQuery = supabaseServer
    .from("reviews")
    .select(
      "id, school_urn, user_id, rating, title, body, created_at, review_sections(id, section_key, rating, comment, created_at)"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  reviewQuery = reviewQuery.eq("school_urn", Number(schoolUrn));

  const { data: reviews, error: reviewsError } = await reviewQuery;

  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  }

  const cleanReviews = (reviews ?? []).filter(reviewIsClean);

  const reviewScores = cleanReviews
    .map((review) => {
      const sectionRatings = (review.review_sections ?? [])
        .map((section) => section.rating)
        .filter((value) => typeof value === "number");

      if (sectionRatings.length === 0) return null;

      const total = sectionRatings.reduce((sum, value) => sum + value, 0);
      return total / sectionRatings.length;
    })
    .filter((value) => typeof value === "number");

  const schoolScore =
    reviewScores.length > 0
      ? reviewScores.reduce((sum, value) => sum + value, 0) / reviewScores.length
      : null;

  return NextResponse.json({
    data: {
      reviews: cleanReviews,
      schoolScore,
      reviewCount: cleanReviews.length,
    },
  });
}

export async function POST(request) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { schoolUrn, rating, title, body: reviewBody, sections } = body;

  if (!schoolUrn) {
    return NextResponse.json(
      { error: "Missing schoolUrn." },
      { status: 400 }
    );
  }

  const supabaseUser = createUserClient(token);

  const { data: review, error: reviewError } = await supabaseUser
    .from("reviews")
    .insert({
      school_urn: schoolUrn ?? null,
      user_id: user.id,
      rating: rating ?? null,
      title: title ?? null,
      body: reviewBody ?? null,
    })
    .select("id, school_urn, user_id, rating, title, body, created_at")
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  const normalizedSections = Array.isArray(sections)
    ? sections
        .filter((section) => section?.sectionKey)
        .map((section) => ({
          review_id: review.id,
          section_key: section.sectionKey,
          rating:
            typeof section.rating === "number" ? section.rating : null,
          comment: section.comment ?? null,
        }))
    : [];

  if (normalizedSections.length > 0) {
    const { error: sectionError } = await supabaseUser
      .from("review_sections")
      .insert(normalizedSections);

    if (sectionError) {
      return NextResponse.json({ error: sectionError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ data: review }, { status: 201 });
}
