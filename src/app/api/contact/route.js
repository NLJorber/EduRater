import { NextResponse } from "next/server";

function isValid(body) {
  return (
    body &&
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.message === "string" &&
    body.name.trim().length > 0 &&
    body.email.includes("@") &&
    body.message.trim().length > 0
  );
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req) {
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.BREVO_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { ok: false, error: "Missing BREVO_API_KEY or BREVO_TO_EMAIL." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!isValid(body)) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload." },
      { status: 400 }
    );
  }

  const { name, email, message } = body;

  // (Optional) Save/update contact in Brevo
  const upsertRes = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name },
      updateEnabled: true,
      // listIds: [2], // optional
    }),
  });

  // Send you the message (Transactional Email)
  const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Website Contact Form", email: toEmail },
      to: [{ email: toEmail }],
      replyTo: { email, name },
      subject: `Website contact form: ${name}`,
      textContent: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      htmlContent: `
        <h3>New contact form submission</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(
          message
        )}</pre>
      `,
    }),
  });

  if (!sendRes.ok) {
    const details = await sendRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: "Brevo email send failed.",
        details,
        contactUpsertOk: upsertRes.ok,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, contactUpsertOk: upsertRes.ok });
}