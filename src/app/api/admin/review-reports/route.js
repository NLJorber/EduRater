// SUMMARY OF RESPONSE STATUS CODES:
/*
  401 if not logged in
  403 if logged in but not in admin_users table
  200 with data: [...] if logged in as admin, including reported review resons + review content
  500 if any unexpected error occurs
*/

import { NextResponse } from "next/server"; // Next.js helper for returning JSON responses from the API route

// getUserFromRequest validates incoming request headers token with Supabase
// createUserClient creates supabase client to act as the user to apply RLS policies from the user making database calls
import { createUserClient, getUserFromRequest } from "@/lib/auth/server"; 

// runs when browser sends a GET request to this API endpoint
export async function GET(request) {
  const { user, error, token } = await getUserFromRequest(request);

  // checks if the logged in user is providing a valid access token
  if (error || !user || !token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // makes Supabase client that sends the token on every request to allow or deny access based on who the user is
  const supabaseUser = createUserClient(token);

  /* 
    admin check using admin_users table rather than role in profiles
    this is to allow for more granular control over who is an admin without
    changing user roles and potentially interfering with RLS policies
  */
  // query admin_users table for a row where user_id = logged in user's id
  const { data: adminRow, error: adminErr } = await supabaseUser
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // if error querying admin_users table return error 500
  if (adminErr) {
    return NextResponse.json({ error: adminErr.message }, { status: 500 });
  }

  // if no row found, user is not an admin, return forbidden 403
  if (!adminRow) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // parses query parameters from request URL
  const { searchParams } = new URL(request.url);

  // limit parameter to limit number of rows returned, max 200
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);

  // fetch reported rows from review_reports table, joining to reviews table to get review details
  const { data, error: fetchErr } = await supabaseUser
    .from("review_reports")
    .select(`
      id,
      review_id,
      reporter_id,
      reason,
      created_at,
      review:review_id (
        id,
        school_urn,
        user_id,
        rating,
        title,
        body,
        created_at,
        deleted_at
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  // if error fetching reported reviews return error 500
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  // remove reports whose review has been deleted
  const rows = (data ?? []).filter((r) => r.review && !r.review.deleted_at);

  const reviewUserIds = [
    ...new Set(rows.map((row) => row.review?.user_id).filter(Boolean)),
  ];

  let authorMap = new Map();
  if (reviewUserIds.length > 0) {
    const { data: settings, error: settingsError } = await supabaseUser
      .from("profile_settings")
      .select("user_id, display_name, avatar_seed, avatar_style")
      .in("user_id", reviewUserIds);

    if (!settingsError && Array.isArray(settings)) {
      authorMap = new Map(settings.map((row) => [row.user_id, row]));
    }
  }

  rows.forEach((row) => {
    if (row.review?.user_id) {
      row.review.author = authorMap.get(row.review.user_id) ?? null;
    }
  });

  // return the final JSON response
  return NextResponse.json({ data: rows });
}
