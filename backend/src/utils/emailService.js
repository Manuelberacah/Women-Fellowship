const nodemailer = require("nodemailer");

// ─── Transport helpers ────────────────────────────────────────────────────────

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  smtpTransporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  return smtpTransporter;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Send via Resend REST API (works on Render – no SMTP port needed)
async function sendViaResend({ to, from, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  let attempt = 0;
  let lastError = null;

  while (attempt <= 2) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Resend ${response.status}: ${JSON.stringify(err)}`);
      }

      const data = await response.json();
      console.log(`Email sent via Resend: ${data.id}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Resend attempt ${attempt + 1}/3 failed:`, error?.message || error);
      if (attempt >= 2) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt += 1;
  }

  console.error("Email permanently failed after retries.", lastError?.message || lastError);
}

// Send via SMTP (local dev / self-hosted)
async function sendViaSmtp({ to, from, subject, html, text }) {
  const mailer = getSmtpTransporter();
  if (!mailer) {
    console.log("Email skipped: no transport configured (set RESEND_API_KEY or SMTP_* vars).");
    return;
  }

  let attempt = 0;
  let lastError = null;
  while (attempt <= 2) {
    try {
      const info = await mailer.sendMail({ from, to, subject, text, html });
      console.log(`Email sent via SMTP: ${info.messageId || "ok"}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`SMTP attempt ${attempt + 1}/3 failed:`, error?.message || error);
      if (attempt >= 2) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt += 1;
  }
  console.error("Email permanently failed after retries.", lastError?.message || lastError);
}

// Unified send — prefers Resend, falls back to SMTP
async function send({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "Eureka Women Fellowship <onboarding@resend.dev>";

  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, from, subject, html, text });
  }
  return sendViaSmtp({ to, from, subject, html, text });
}

// ─── Email templates ──────────────────────────────────────────────────────────

async function sendNotification({ subject, text, html }) {
  const to = process.env.EMAIL_TO || process.env.SMTP_USER;
  if (!to) {
    console.log("Email skipped: EMAIL_TO not set.");
    return;
  }
  await send({ to, subject, html, text });
}

async function sendVerificationEmail(to, name, verifyUrl) {
  const subject = "Verify your email – Eureka Women Fellowship";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7c3aed">Eureka Women Fellowship</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining! Please verify your email address to complete your membership.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours. If you did not sign up, ignore this email.</p>
    </div>
  `;
  const text = `Hi ${name},\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`;
  await send({ to, subject, html, text });
}

async function sendEventConfirmation(to, name, eventName, eventDate) {
  const subject = `Registration Confirmed – ${eventName}`;
  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#7c3aed">Eureka Women Fellowship</h2>
      <p>Dear ${name},</p>
      <p>Your registration for <strong>${eventName}</strong> on <strong>${formattedDate}</strong> has been confirmed. Your payment of ₹200 was received successfully.</p>
      <div style="margin:20px 0;padding:16px;background:#f5f3ff;border-radius:12px">
        <p style="margin:0;font-size:14px;color:#4c1d95">Your event pass is currently being designed. We will send it to you once it is ready. Please keep an eye on this email.</p>
      </div>
      <p>We look forward to seeing you at the gathering. God bless you!</p>
      <p style="color:#64748b;font-size:13px;margin-top:24px">– Eureka Women Fellowship Team</p>
    </div>
  `;
  const text = `Dear ${name},\n\nYour registration for ${eventName} on ${formattedDate} is confirmed. Payment of ₹200 received.\n\nYour event pass is being designed and will be sent to you once ready.\n\nGod bless you!\n– Eureka Women Fellowship Team`;
  await send({ to, subject, html, text });
}

module.exports = { sendNotification, sendVerificationEmail, sendEventConfirmation };
