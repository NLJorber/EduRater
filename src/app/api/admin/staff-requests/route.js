import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";

const allowedStatuses = new Set(["pending", "approved", "rejected"]);

export async function GET(request) {
  const authResult = await requireSuperAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = authResult.supabaseUser
    .from("staff_requests")
    .select("id, user_id, school_id, status, evidence, created_at")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request) {
  const authResult = await requireSuperAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing id or status." },
      { status: 400 }
    );
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data: requestRow, error: requestError } = await authResult.supabaseUser
    .from("staff_requests")
    .select("id, user_id, school_id, status")
    .eq("id", id)
    .single();

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 });
  }

  if (!requestRow) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { error: updateError } = await authResult.supabaseUser
    .from("staff_requests")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (status === "approved") {
    await authResult.supabaseUser
      .from("profiles")
      .update({ role: "staff_verified", school_id: requestRow.school_id })
      .eq("id", requestRow.user_id);
  }

  if (status === "rejected") {
    await authResult.supabaseUser
      .from("profiles")
      .update({ role: "user", school_id: null })
      .eq("id", requestRow.user_id)
      .eq("role", "staff_pending");
  }

  return NextResponse.json({ data: { id, status } });
}
