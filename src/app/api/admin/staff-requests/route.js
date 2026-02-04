import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

const allowedStatuses = new Set(["pending", "approved", "rejected"]);

export async function GET(request) {
  const authResult = await requireAdmin(request);
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
    .select(
      "id, user_id, school_id, status, full_name, position, school_email, evidence, created_at, schools(name, domain)"
    )
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
  const authResult = await requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { id, status, schoolId } = body;

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

  const updatePayload = { status };
  if (schoolId) {
    updatePayload.school_id = schoolId;
  }

  const { error: updateError } = await authResult.supabaseUser
    .from("staff_requests")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const finalSchoolId = schoolId || requestRow.school_id;

  if (status === "approved") {
    if (requestRow.user_id) {
      const { error: profileError } = await supabaseServer
        .from("profiles")
        .update({ role: "staff_verified", school_id: finalSchoolId })
        .eq("id", requestRow.user_id);
      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }
    }
  }

  if (status === "rejected") {
    if (requestRow.user_id) {
      const { error: profileError } = await supabaseServer
        .from("profiles")
        .update({ role: "user", school_id: null })
        .eq("id", requestRow.user_id)
        .eq("role", "staff_pending");
      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ data: { id, status } });
}
