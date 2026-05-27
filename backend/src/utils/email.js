import { Resend } from "resend";
import { env } from "../config/env.js";

let resendClient = null;

const getClient = () => {
  if (!env.email.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resendClient) {
    resendClient = new Resend(env.email.resendApiKey);
  }
  return resendClient;
};

const PALETTE = {
  pageBg: "#F5F7FA",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  textDark: "#1F2937",
  textBody: "#374151",
  textMuted: "#6B7280",
  textFooter: "#9CA3AF",
  brand: "#3182CE",
  brandPurple: "#805AD5",
  accentBg: "#F0F4F8",
};

const layout = ({ preheader, eyebrow, title, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${PALETTE.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${PALETTE.pageBg};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.pageBg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PALETTE.cardBg};border:1px solid ${PALETTE.border};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,0.04),0 1px 2px rgba(16,24,40,0.06);">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${PALETTE.brand},${PALETTE.brandPurple});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 40px 32px 40px;">
              <div style="font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${PALETTE.brand};margin-bottom:8px;">${env.email.appName}</div>
              <div style="font-size:13px;color:${PALETTE.textMuted};margin-bottom:24px;">${eyebrow}</div>
              <h1 style="margin:0 0 20px 0;color:${PALETTE.textDark};font-size:22px;font-weight:700;line-height:1.3;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 28px 40px;border-top:1px solid ${PALETTE.border};">
              <div style="font-size:12px;color:${PALETTE.textFooter};line-height:1.5;">
                You're receiving this email because someone (hopefully you) used this address with ${env.email.appName}.
                If this wasn't you, you can safely ignore this message.
              </div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:${PALETTE.textFooter};margin-top:16px;">
          &copy; ${new Date().getFullYear()} ${env.email.appName}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendVerificationCodeEmail = async ({ to, code, username }) => {
  if (!env.email.resendApiKey) {
    console.warn(`[email] RESEND_API_KEY missing — verification code for ${to}: ${code}`);
    return { skipped: true };
  }

  const appName = env.email.appName;
  const subject = `Your ${appName} verification code`;
  const preheader = `Your verification code is ${code}. Expires in 15 minutes.`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;font-size:16px;color:${PALETTE.textBody};line-height:1.6;">Hi ${username || "there"},</p>
    <p style="margin:0 0 24px 0;font-size:16px;color:${PALETTE.textBody};line-height:1.6;">
      Use the code below to verify your email address and finish setting up your account:
    </p>
    <div style="background:${PALETTE.accentBg};border:1px solid ${PALETTE.border};border-radius:12px;padding:24px;text-align:center;margin:0 0 24px 0;">
      <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:${PALETTE.textDark};font-family:'SF Mono','Menlo','Consolas',monospace;">${code}</div>
    </div>
    <p style="margin:0;font-size:14px;color:${PALETTE.textMuted};line-height:1.6;">
      This code expires in <strong style="color:${PALETTE.textBody};">15 minutes</strong>. If you didn't try to sign up, you can safely ignore this email.
    </p>
  `;

  const html = layout({
    preheader,
    eyebrow: "Verify your email",
    title: "Confirm your email address",
    bodyHtml,
  });

  const text = `Hi ${username || "there"},\n\nYour ${appName} verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't try to sign up, you can ignore this email.`;

  try {
    const result = await getClient().emails.send({
      from: env.email.from,
      to,
      subject,
      html,
      text,
    });
    return result;
  } catch (err) {
    console.error("[email] Failed to send verification email:", err?.message || err);
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async ({ to, resetUrl, username }) => {
  if (!env.email.resendApiKey) {
    console.warn(`[email] RESEND_API_KEY missing — password reset link for ${to}: ${resetUrl}`);
    return { skipped: true };
  }

  const appName = env.email.appName;
  const subject = `Reset your ${appName} password`;
  const preheader = `Click the link to choose a new password. Expires in 1 hour.`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;font-size:16px;color:${PALETTE.textBody};line-height:1.6;">Hi ${username || "there"},</p>
    <p style="margin:0 0 24px 0;font-size:16px;color:${PALETTE.textBody};line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one:
    </p>
    <div style="text-align:center;margin:0 0 24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(90deg,${PALETTE.brand},${PALETTE.brandPurple});color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:16px;">
        Reset password
      </a>
    </div>
    <p style="margin:0 0 8px 0;font-size:13px;color:${PALETTE.textMuted};line-height:1.6;">
      Or paste this link into your browser:
    </p>
    <p style="margin:0 0 24px 0;font-size:13px;word-break:break-all;line-height:1.5;">
      <a href="${resetUrl}" style="color:${PALETTE.brand};text-decoration:underline;">${resetUrl}</a>
    </p>
    <p style="margin:0;font-size:14px;color:${PALETTE.textMuted};line-height:1.6;">
      This link expires in <strong style="color:${PALETTE.textBody};">1 hour</strong> and can only be used once.
      If you didn't request a reset, you can safely ignore this email — your password won't change.
    </p>
  `;

  const html = layout({
    preheader,
    eyebrow: "Password reset",
    title: "Reset your password",
    bodyHtml,
  });

  const text = `Hi ${username || "there"},\n\nReset your ${appName} password by visiting:\n\n${resetUrl}\n\nThis link expires in 1 hour and can only be used once.\n\nIf you didn't request this, you can ignore this email.`;

  try {
    const result = await getClient().emails.send({
      from: env.email.from,
      to,
      subject,
      html,
      text,
    });
    return result;
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err?.message || err);
    throw new Error("Failed to send password reset email");
  }
};
