/* 
    Route Handler to report a review 
    POST /api/reviews/[id]/report

    - requires login
    - reads review id from URL
    - reads reason from request body
    - inserts a row into review_reports table
*/

import { NextResponse } from "next/server"; // Next.js helper for returning responses from Route Handlers

// getUserFromRequest validates incoming request headers token with Supabase
// createUserClient creates supabase client to act as the user to apply RLS policies from the user making database calls
import { createUserClient, getUserFromRequest } from "@/lib/auth/server";

// defined to handle POST requests to report a review
export async function POST(request, { params }) {
    // get the user making the request and their token
    const { user, error, token } = await getUserFromRequest(request);

    // checks if the logged in user is providing a valid access token
    if (error || !user || !token) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // get the review ID from the URL parameters
    const { id: reviewId } = await params;

    // check if reviewId is provided
    if (!reviewId) {
        return NextResponse.json({ error: "Missing review id." }, { status: 400 });
    }

    /*
        tries to parse JSON from the request body
        if parsing fails, defaults to an empty object
        extracts reason
    */
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // check if reason is provided for reporting the review
    if (!reason) {
        return NextResponse.json({ error: "Missing reason for report." }, { status: 400 });
    }

    // makes Supabase client that sends the token on every request to allow or deny access based on who the user is
    const supabaseUser = createUserClient(token);

    /*
        inserts one row into the review_reports table with:
        review_id: the ID of the review being reported
        reporter_id: the ID of the user reporting the review
        reason: the reason provided for reporting the review
    */
    const { error: insertError } = await supabaseUser.from("review_reports").insert({
        review_id: reviewId,
        reporter_id: user.id,
        reason,
    });

    // if there was an error inserting the report, return a 500 error with the message
    // reasons for rejection could be RLS policies or missing foreign key or duplicate unique constraint
    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // if insert was successful, return a 201 Created response
    return NextResponse.json({ ok: true }, { status: 201 });
}