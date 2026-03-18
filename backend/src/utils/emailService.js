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

module.exports = { sendNotification };
