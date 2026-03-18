const OtpToken = require("../models/OtpToken");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(phone) {
  const otp = generateOtp();
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 5);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await OtpToken.create({ phone, otp, expiresAt });

  if (process.env.OTP_PROVIDER === "mock") {
    console.log(`OTP for ${phone}: ${otp}`);
  }

  return otp;
}

async function verifyOtp(phone, otp) {
  const token = await OtpToken.findOne({ phone, otp, verified: false }).sort({ createdAt: -1 });
  if (!token) return false;
  if (token.expiresAt < new Date()) return false;
  token.verified = true;
  await token.save();
  return true;
}

module.exports = { sendOtp, verifyOtp };
