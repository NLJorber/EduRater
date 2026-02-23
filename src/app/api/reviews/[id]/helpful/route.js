import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

export async function POST(request, { params }) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user || !token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: reviewId } = await params;
  if (!reviewId) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const shouldLike = Boolean(body?.like);

  const supabaseUser = createUserClient(token);

  if (shouldLike) {
    const { error: insertError } = await supabaseUser
      .from("review_helpful_votes")
      .insert({ review_id: reviewId, user_id: user.id });

    if (insertError && insertError.code !== "23505") {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  } else {
    const { error: deleteError } = await supabaseUser
      .from("review_helpful_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  const { count } = await supabaseUser
    .from("review_helpful_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  return NextResponse.json({
    data: {
      review_id: reviewId,
      helpful_count: count ?? 0,
      helpful_voted: shouldLike,
    },
  });
}
