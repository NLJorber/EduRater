import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

export async function PATCH(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const reviewId = params?.id;
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { rating, title, body: reviewBody, sections } = body;

  const supabaseUser = createUserClient(token);

  const updatePayload = {};
  if (rating !== undefined) {
    updatePayload.rating = rating ?? null;
  }
  if (title !== undefined) {
    updatePayload.title = title ?? null;
  }
  if (reviewBody !== undefined) {
    updatePayload.body = reviewBody ?? null;
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabaseUser
      .from("reviews")
      .update(updatePayload)
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  if (Array.isArray(sections)) {
    const { error: deleteError } = await supabaseUser
      .from("review_sections")
      .delete()
      .eq("review_id", reviewId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const normalizedSections = sections
      .filter((section) => section?.sectionKey)
      .map((section) => ({
        review_id: reviewId,
        section_key: section.sectionKey,
        rating: typeof section.rating === "number" ? section.rating : null,
        comment: section.comment ?? null,
      }));

    if (normalizedSections.length > 0) {
      const { error: insertError } = await supabaseUser
        .from("review_sections")
        .insert(normalizedSections);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ data: { id: reviewId } });
}

export async function DELETE(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const reviewId = params?.id;
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const supabaseUser = createUserClient(token);

  const { error: deleteError } = await supabaseUser
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: reviewId } });
}
