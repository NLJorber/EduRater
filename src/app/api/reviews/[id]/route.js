import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest, requireAdmin } from "@/lib/auth/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: reviewId } = await params;
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, body: reviewBody, sections } = body; // removed rating

  const supabaseUser = createUserClient(token);

  const { data: review, error: reviewError } = await supabaseUser
    .from("reviews")
    .select("id, user_id, deleted_at")
    .eq("id", reviewId)
    .maybeSingle();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  if (!review || review.deleted_at) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const isOwner = review.user_id === user.id;
  if (!isOwner) {
    const adminResult = await requireAdmin(request);
    if (adminResult.error) {
      return NextResponse.json(
        { error: adminResult.error },
        { status: adminResult.status }
      );
    }
  }

  let writeClient;
  try {
    // Authorized edit path (owner or admin) writes with service role to avoid RLS drift.
    writeClient = createServiceRoleClient();
  } catch (clientError) {
    return NextResponse.json(
      { error: clientError.message || "Server misconfiguration." },
      { status: 500 }
    );
  }

  // Update review text fields only (overall rating is computed)
  const updatePayload = {};
  if (title !== undefined) updatePayload.title = title ?? null;
  if (reviewBody !== undefined) updatePayload.body = reviewBody ?? null;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await writeClient
      .from("reviews")
      .update(updatePayload)
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Replace sections if provided
  if (Array.isArray(sections)) {
    // Deduplicate by section key so malformed payloads cannot hit unique(review_id, section_key).
    const sectionMap = new Map();
    for (const section of sections) {
      const sectionKey =
        typeof section?.sectionKey === "string" ? section.sectionKey.trim() : "";
      if (!sectionKey) continue;
      sectionMap.set(sectionKey, {
        review_id: reviewId,
        section_key: sectionKey,
        rating: typeof section.rating === "number" ? section.rating : null,
        comment:
          typeof section.comment === "string" && section.comment.trim()
            ? section.comment.trim()
            : null,
      });
    }
    const normalizedSections = Array.from(sectionMap.values());

    // Enforce your rules on edit too
    const isValidRating = (rating) =>
      typeof rating === "number" &&
      rating >= 1 &&
      rating <= 5 &&
      Math.round(rating * 2) / 2 === rating;

    const hasAtLeastOneRating = normalizedSections.some((s) =>
      isValidRating(s.rating)
    );

    if (!hasAtLeastOneRating) {
      return NextResponse.json(
        { error: "Please rate at least one section." },
        { status: 400 }
      );
    }

    // Upsert avoids duplicate-key failures when existing section rows are present.
    const { error: upsertError } = await writeClient
      .from("review_sections")
      .upsert(normalizedSections, { onConflict: "review_id,section_key" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Optional: refetch computed rating after triggers (nice for UI)
    const { data: updatedReview } = await writeClient
      .from("reviews")
      .select("id, rating_computed")
      .eq("id", reviewId)
      .single();

    return NextResponse.json({ data: updatedReview ?? { id: reviewId } });
  }

  return NextResponse.json({ data: { id: reviewId } });
}

export async function DELETE(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: reviewId } = await params;
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const supabaseUser = createUserClient(token);

  const { data: review, error: fetchError } = await supabaseUser
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const isOwner = review.user_id === user.id;

  if (!isOwner) {
    const adminResult = await requireAdmin(request);
    if (adminResult.error) {
      return NextResponse.json(
        { error: adminResult.error },
        { status: adminResult.status }
      );
    }

    const { error: deleteError } = await adminResult.supabaseUser
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { id: reviewId } });
  }

  const { error: deleteError } = await supabaseUser
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: reviewId } });
}
