import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

export async function GET(request) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabaseUser = createUserClient(token);

  const { data, error: fetchError } = await supabaseUser
    .from("staff_requests")
    .select("id, school_id, status, evidence, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabaseUser = createUserClient(token);
  const body = await request.json().catch(() => ({}));
  const { schoolId, evidence } = body;

  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseUser
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (["super_admin", "staff_verified"].includes(profile?.role)) {
    return NextResponse.json(
      { error: "Account already has staff access." },
      { status: 400 }
    );
  }

  const { data: existingRequest, error: existingError } = await supabaseUser
    .from("staff_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingRequest) {
    return NextResponse.json(
      { error: "Request already exists for this school." },
      { status: 409 }
    );
  }

  const { data: staffRequest, error: insertError } = await supabaseUser
    .from("staff_requests")
    .insert({
      user_id: user.id,
      school_id: schoolId,
      status: "pending",
      evidence: evidence ?? null,
    })
    .select("id, school_id, status, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabaseUser
    .from("profiles")
    .update({ role: "staff_pending", school_id: schoolId })
    .eq("id", user.id)
    .eq("role", "user");

  return NextResponse.json({ data: staffRequest }, { status: 201 });
}
