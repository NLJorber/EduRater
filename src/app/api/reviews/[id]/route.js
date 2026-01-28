import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

export async function PATCH(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: reviewId } = params; // no await
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, body: reviewBody, sections } = body; // removed rating

  const supabaseUser = createUserClient(token);

  // Update review text fields only (overall rating is computed)
  const updatePayload = {};
  if (title !== undefined) updatePayload.title = title ?? null;
  if (reviewBody !== undefined) updatePayload.body = reviewBody ?? null;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabaseUser
      .from("reviews")
      .update(updatePayload)
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Replace sections if provided
  if (Array.isArray(sections)) {
    const normalizedSections = sections
      .filter((section) => section?.sectionKey)
      .map((section) => ({
        review_id: reviewId,
        section_key: section.sectionKey,
        rating: typeof section.rating === "number" ? section.rating : null,
        comment:
          typeof section.comment === "string" && section.comment.trim()
            ? section.comment.trim()
            : null,
      }));

    // Enforce your rules on edit too
    const hasAtLeastOneRating = normalizedSections.some(
      (s) => typeof s.rating === "number" && s.rating >= 1 && s.rating <= 5
    );

    const hasAtLeastOneSectionComment = normalizedSections.some(
      (s) => typeof s.comment === "string" && s.comment.trim().length > 0
    );

    if (!hasAtLeastOneRating) {
      return NextResponse.json(
        { error: "Please rate at least one section." },
        { status: 400 }
      );
    }

    if (!hasAtLeastOneSectionComment) {
      return NextResponse.json(
        { error: "Please write a comment in at least one section." },
        { status: 400 }
      );
    }

    // Delete existing sections then insert new ones
    const { error: deleteError } = await supabaseUser
      .from("review_sections")
      .delete()
      .eq("review_id", reviewId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const { error: insertError } = await supabaseUser
      .from("review_sections")
      .insert(normalizedSections);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Optional: refetch computed rating after triggers (nice for UI)
    const { data: updatedReview } = await supabaseUser
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

  const { id: reviewId } = params; // no await
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

  const { error: deleteError } = await supabaseUser
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: reviewId } });
}