import { NextResponse } from "next/server";
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

export async function GET(request) {
  const { user, error, token } = await getUserFromRequest(request);

  if (error || !user || !token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabaseUser = createUserClient(token);
  const { data, error: rpcError } = await supabaseUser.rpc(
    "get_school_review_counts"
  );

  if (rpcError) {
    const forbidden = /not authorized|permission/i.test(rpcError.message || "");
    return NextResponse.json(
      { error: forbidden ? "Forbidden." : rpcError.message },
      { status: forbidden ? 403 : 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}
