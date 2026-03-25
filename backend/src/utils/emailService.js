const nodemailer = require("nodemailer");

// ─── Transport helpers ────────────────────────────────────────────────────────

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
  return smtpTransporter;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Brevo (free 300 emails/day, HTTP API, no SMTP port needed) ──────────────

async function sendViaBrevo({ to, from, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const fromEmail = from.includes("<") ? from.match(/<(.+)>/)?.[1] || from : from;
  const fromName = from.includes("<") ? from.split("<")[0].trim() : "Eureka Women Fellowship";

  let attempt = 0;
  while (attempt <= 2) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: Array.isArray(to) ? to[0] : to }],
          subject,
          htmlContent: html || `<p>${text}</p>`,
          textContent: text
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Brevo ${response.status}: ${JSON.stringify(err)}`);
      }

      const data = await response.json();
      console.log(`[EMAIL OK] Brevo | TO: ${Array.isArray(to) ? to[0] : to} | FROM: ${fromEmail} | SUBJECT: "${subject}" | ID: ${data.messageId || "ok"}`);
      return true;
    } catch (error) {
      console.error(`Brevo attempt ${attempt + 1}/3 failed:`, error?.message || error);
      if (attempt >= 2) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt += 1;
  }
  return false;
}

// ─── Resend (fallback) ───────────────────────────────────────────────────────

async function sendViaResend({ to, from, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  let attempt = 0;
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
      console.log(`[EMAIL OK] Resend | TO: ${Array.isArray(to) ? to[0] : to} | FROM: ${from} | SUBJECT: "${subject}" | ID: ${data.id}`);
      return true;
    } catch (error) {
      console.error(`Resend attempt ${attempt + 1}/3 failed:`, error?.message || error);
      if (attempt >= 2) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt += 1;
  }
  return false;
}

// ─── SMTP (local dev) ────────────────────────────────────────────────────────

async function sendViaSmtp({ to, from, subject, html, text }) {
  const mailer = getSmtpTransporter();
  if (!mailer) return false;

  let attempt = 0;
  while (attempt <= 2) {
    try {
      const info = await mailer.sendMail({ from, to, subject, text, html });
      console.log(`[EMAIL OK] SMTP | TO: ${to} | FROM: ${from} | SUBJECT: "${subject}" | ID: ${info.messageId || "ok"}`);
      return true;
    } catch (error) {
      console.error(`SMTP attempt ${attempt + 1}/3 failed:`, error?.message || error);
      if (attempt >= 2) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt += 1;
  }
  return false;
}

// ─── Unified send: Brevo → SMTP → Resend ────────────────────────────────────

async function send({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "Eureka Women Fellowship <onboarding@resend.dev>";
  console.log(`[EMAIL SENDING] TO: ${to} | SUBJECT: "${subject}"`);

  if (await sendViaBrevo({ to, from, subject, html, text })) return;
  if (await sendViaSmtp({ to, from, subject, html, text })) return;
  if (await sendViaResend({ to, from, subject, html, text })) return;

  console.error(`[EMAIL FAILED] All transports failed | TO: ${to} | SUBJECT: "${subject}"`);
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

async function sendWelcomeEmail(to, name) {
  const subject = "Welcome to Eureka Women Fellowship!";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7c3aed">Eureka Women Fellowship</h2>
      <p>Dear ${name},</p>
      <p>Your email has been verified and you are now an official member of <strong>Eureka Women Fellowship</strong>.</p>
      <p>Thank you for joining us! We are blessed to have you as part of our community. Stay tuned for upcoming events, gatherings, and fellowship opportunities.</p>
      <p style="margin-top:20px">God bless you!</p>
      <p style="color:#64748b;font-size:13px;margin-top:24px">– Eureka Women Fellowship Team</p>
    </div>
  `;
  const text = `Dear ${name},\n\nYour email has been verified and you are now an official member of Eureka Women Fellowship.\n\nThank you for joining us!\n\nGod bless you!\n– Eureka Women Fellowship Team`;
  await send({ to, subject, html, text });
}

async function sendPrayerDoneEmail(to, name) {
  const subject = "Your Prayer Has Been Prayed For – Eureka Women Fellowship";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7c3aed">Eureka Women Fellowship</h2>
      <p>Dear ${name},</p>
      <p>We want you to know that your prayer request has been <strong>prayed for</strong> by our fellowship community.</p>
      <p>We continue to keep you in our prayers. May God's grace and peace be with you always.</p>
      <div style="margin:20px 0;padding:16px;background:#f5f3ff;border-radius:12px">
        <p style="margin:0;font-size:14px;color:#4c1d95;font-style:italic">"The prayer of a righteous person is powerful and effective." – James 5:16</p>
      </div>
      <p style="color:#64748b;font-size:13px;margin-top:24px">– Eureka Women Fellowship Team</p>
    </div>
  `;
  const text = `Dear ${name},\n\nYour prayer request has been prayed for by our fellowship community.\n\nWe continue to keep you in our prayers.\n\n"The prayer of a righteous person is powerful and effective." – James 5:16\n\nGod bless you!\n– Eureka Women Fellowship Team`;
  await send({ to, subject, html, text });
}

module.exports = { sendNotification, sendVerificationEmail, sendEventConfirmation, sendWelcomeEmail, sendPrayerDoneEmail };
