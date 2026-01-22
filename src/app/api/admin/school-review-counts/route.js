// Next.js helper for returning JSON responses from the API route
import { NextResponse } from "next/server";

// getUserFromRequest validates incoming request headers token with Supabase
// createUserClient creates supabase client to act as the user to apply RLS policies from the user making database calls
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

// when the browser sends a GET request to this API endpoint
export async function GET(request) {
  const { user, error, token } = await getUserFromRequest(request);

  // checks if the logged in user is providing a valid access token
  if (error || !user || !token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // makes Supabase client that sends the token on every request to allow or deny access based on who the user is
  const supabaseUser = createUserClient(token);

  // call a Postgres function to get the counts
  const { data, error: rpcError } = await supabaseUser.rpc(
    // a PostgreSQL function in Supabase named get_school_review_counts
    "get_school_review_counts"
    /* 
      group schools by URN
      count how many reviews each school has
      join to school data to get the school name
      return array of rows
    */
  );

  // if RPC fails then rpcError contains why
  if (rpcError) {
    const forbidden = /not authorized|permission/i.test(rpcError.message || "");
    return NextResponse.json(
      { error: forbidden ? "Forbidden." : rpcError.message },
      { status: forbidden ? 403 : 500 }
    );
  }

  // if RPC worked, data is the array returned by the database function
  return NextResponse.json({ data: data ?? [] });
}
