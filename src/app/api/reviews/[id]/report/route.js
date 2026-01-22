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
    const { reason, details } = body;

    if (!reason) {
        return NextResponse.json({ error: "Missing reason for report." }, { status: 400 });
    }

    const supabaseUser = createUserClient(token);

    const { error: insertError } = await supabaseUser.from("review_reports").insert({
        review_id: reviewId,
        reporter_id: user.id,
        reason,
    });

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
}