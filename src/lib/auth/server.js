import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE_ANON_KEY.");
}

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing bearer token.", token: null };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error) {
    return { user: null, error: error.message, token: null };
  }

  return { user: data?.user ?? null, error: null, token };
}

export async function requireSuperAdmin(request) {
  const { user, error, token } = await getUserFromRequest(request);
  if (error || !user) {
    return { error: "Unauthorized.", status: 401 };
  }

  const supabaseUser = createUserClient(token);

  const { data: profile, error: profileError } = await supabaseUser
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: profileError.message, status: 500 };
  }

  if (profile?.role !== "super_admin") {
    return { error: "Forbidden.", status: 403 };
  }

  return { user, profile, error: null, status: 200, supabaseUser };
}

export function createUserClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
