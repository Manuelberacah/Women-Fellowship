const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(mailer, mailOptions, retries = 2) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      const info = await mailer.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId || "ok"}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Email send failed (attempt ${attempt + 1}/${retries + 1}):`, error?.message || error);
      if (attempt >= retries) break;
      const backoffMs = 1000 * Math.pow(2, attempt);
      await sleep(backoffMs);
    }
    attempt += 1;
  }

  console.error("Email permanently failed after retries.", lastError?.message || lastError);
}

async function sendEventConfirmation(to, name, eventName, eventDate) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("Email skipped: SMTP not configured. Would send event confirmation to:", to);
    return;
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
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

  await sendWithRetry(mailer, { from, to, subject, text, html });
}

async function sendVerificationEmail(to, name, verifyUrl) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("Email skipped: SMTP not configured. Verify URL:", verifyUrl);
    return;
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const subject = "Verify your email – Eureka Women Fellowship";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#7c3aed">Eureka Women Fellowship</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining! Please verify your email address to complete your membership.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours. If you did not sign up, you can ignore this email.</p>
    </div>
  `;
  const text = `Hi ${name},\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`;

  await sendWithRetry(mailer, { from, to, subject, text, html });
}

async function sendNotification({ subject, text, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("Email skipped: SMTP not configured");
    return;
  }

  const to = process.env.EMAIL_TO || process.env.SMTP_USER;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await sendWithRetry(mailer, { from, to, subject, text, html });
}

module.exports = { sendNotification, sendVerificationEmail, sendEventConfirmation };
