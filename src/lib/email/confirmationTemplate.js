export function buildConfirmationEmailHtml({
  displayName,
  confirmationUrl,
  appName = "EduRater",
}) {
  const safeName = displayName?.trim() || "there";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f9fc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:12px;padding:28px;">
      <h1 style="margin:0 0 12px;color:#1f3f75;font-size:24px;">Confirm your email</h1>
      <p style="margin:0 0 10px;color:#253858;font-size:16px;line-height:1.5;">
        Hi ${safeName},
      </p>
      <p style="margin:0 0 20px;color:#253858;font-size:16px;line-height:1.5;">
        Welcome to ${appName}. Please confirm your email address to finish creating your account.
      </p>
      <p style="margin:0 0 24px;">
        <a
          href="${confirmationUrl}"
          style="display:inline-block;background:#ff7b00;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;"
        >
          Confirm email
        </a>
      </p>
      <p style="margin:0;color:#5e6c84;font-size:13px;line-height:1.5;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  </div>
  `;
}
