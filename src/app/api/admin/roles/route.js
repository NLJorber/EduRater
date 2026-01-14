import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";

const allowedRoles = new Set([
  "super_admin",
  "user",
  "staff_pending",
  "staff_verified",
]);

export async function POST(request) {
  const authResult = await requireSuperAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { userId, role, schoolId } = body;

  if (!userId || !role) {
    return NextResponse.json(
      { error: "Missing userId or role." },
      { status: 400 }
    );
  }

  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const updatePayload = { role };

  if (role === "staff_verified") {
    if (!schoolId) {
      return NextResponse.json(
        { error: "staff_verified requires schoolId." },
        { status: 400 }
      );
    }
    updatePayload.school_id = schoolId;
  } else if (role === "user" || role === "super_admin") {
    updatePayload.school_id = null;
  } else if (schoolId) {
    updatePayload.school_id = schoolId;
  }

  const { data, error } = await authResult.supabaseUser
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select("id, role, school_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
