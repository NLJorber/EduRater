import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildConfirmationEmailHtml } from "@/lib/email/confirmationTemplate";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.RESEND_FROM_EMAIL;

function getOrigin(request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server auth configuration is incomplete." },
      { status: 500 }
    );
  }

  if (!resendApiKey || !emailFrom) {
    return NextResponse.json(
      { error: "Email delivery configuration is incomplete." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = `${payload?.email || ""}`.trim().toLowerCase();
  const password = `${payload?.password || ""}`;
  const displayName = `${payload?.displayName || ""}`.trim();

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const redirectTo = `${getOrigin(request)}/auth/callback`;
  const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo,
      data: {
        display_name: displayName,
      },
    },
  });

  if (linkError) {
    const msg = `${linkError.message || ""}`.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return NextResponse.json({
        ok: true,
        message:
          "If the email can be registered, we sent a verification link. If you already have an account, sign in or reset your password.",
      });
    }

    return NextResponse.json(
      { error: "Could not start sign-up. Please try again." },
      { status: 400 }
    );
  }

  const confirmationUrl = data?.properties?.action_link;
  if (!confirmationUrl) {
    return NextResponse.json(
      { error: "Could not create confirmation link." },
      { status: 500 }
    );
  }

  const html = buildConfirmationEmailHtml({
    displayName,
    confirmationUrl,
  });

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [email],
      subject: "Confirm your EduRater account",
      html,
    }),
  });

  if (!resendResponse.ok) {
    return NextResponse.json(
      { error: "Sign-up started, but we could not send the confirmation email." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      "If the email can be registered, we sent a verification link. If you already have an account, sign in or reset your password.",
  });
}
