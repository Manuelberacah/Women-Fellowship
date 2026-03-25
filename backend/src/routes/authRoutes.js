const crypto = require("crypto");
const express = require("express");

function getAppUrl() {
  const appUrl = process.env.APP_URL;
  if (appUrl) return appUrl.trim().replace(/\/$/, "");
  const frontendUrl = process.env.FRONTEND_URL || "";
  const first = frontendUrl.split(",")[0].trim().replace(/\/$/, "");
  return first && first !== "*" ? first : "http://localhost:3000";
}

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtp, verifyOtp } = require("../utils/otpService");
const { sendNotification, sendVerificationEmail, sendWelcomeEmail } = require("../utils/emailService");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();
const ADMIN_EMAIL = "manuelberacah.gospel@gmail.com";
const ADMIN_PASSWORD = "@Blessy717";

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, churchName, city, mode, phoneVerified } = req.body;

    const filter = [];
    if (email) filter.push({ email });
    if (phone) filter.push({ phone });
    if (filter.length) {
      const existing = await User.findOne({ $or: filter });
      if (existing) return res.status(400).json({ message: "User already exists" });
    }

    let emailVerifyToken;
    let emailVerifyExpires;
    if (mode === "email" && email) {
      emailVerifyToken = crypto.randomBytes(32).toString("hex");
      emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const user = await User.create({
      name,
      phone: phone || undefined,
      email: email || undefined,
      churchName,
      city,
      phoneVerified: mode === "phone" ? Boolean(phoneVerified) : false,
      emailVerified: false,
      emailVerifyToken,
      emailVerifyExpires
    });

    if (mode === "email" && email && emailVerifyToken) {
      const verifyUrl = `${getAppUrl()}/verify-email?token=${emailVerifyToken}`;
      sendVerificationEmail(email, name, verifyUrl).catch(() => null);
    }

    sendNotification({
      subject: "New Member Signup",
      text: `Name: ${user.name}\nPhone: ${user.phone || "-"}\nEmail: ${user.email || "-"}\nChurch: ${user.churchName}\nCity: ${user.city}`
    }).catch(() => null);

    res.json({ message: "Registered", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: "admin-static", role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { email, role: "admin", name: "Admin" } });
});

router.post("/request-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });
  await sendOtp(phone);
  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  const valid = await verifyOtp(phone, otp);
  if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });

  const user = await User.findOne({ phone });
  if (user) {
    user.phoneVerified = true;
    await user.save();
  }

  const token = user
    ? jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })
    : null;

  res.json({ message: "Verified", token, user });
});

router.post("/verify-msg91", async (req, res) => {
  const { phone, accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: "Access token required" });
  if (!process.env.MSG91_AUTH_KEY) return res.status(500).json({ message: "MSG91 auth key missing" });

  try {
    const response = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authkey: process.env.MSG91_AUTH_KEY, "access-token": accessToken })
    });
    const data = await response.json().catch(() => ({}));
    console.log("MSG91 verifyAccessToken response", response.status, data);
    const status = String(data?.type || data?.status || "").toLowerCase();
    const ok = response.ok && status !== "error" && status !== "failed" && status !== "failure";
    if (!ok) return res.status(400).json({ message: "OTP verification failed", provider: data, statusCode: response.status });

    let user = null;
    if (phone) {
      user = await User.findOne({ phone });
      if (user) {
        user.phoneVerified = true;
        await user.save();
      }
    }

    const token = user
      ? jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })
      : null;

    res.json({ message: "Verified", token, user, provider: data });
  } catch (error) {
    res.status(500).json({ message: "MSG91 verification failed" });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token required" });

  const user = await User.findOne({ emailVerifyToken: token });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });
  if (user.emailVerifyExpires < new Date()) return res.status(400).json({ message: "Token has expired. Please request a new verification email." });

  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  // Send welcome email to the user
  sendWelcomeEmail(user.email, user.name).catch(() => null);

  res.json({ message: "Email verified successfully" });
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "No account found with this email" });
  if (user.emailVerified) return res.status(400).json({ message: "Email is already verified" });

  const emailVerifyToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = emailVerifyToken;
  user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${getAppUrl()}/verify-email?token=${emailVerifyToken}`;
  sendVerificationEmail(email, user.name, verifyUrl).catch(() => null);

  res.json({ message: "Verification email sent" });
});

router.get("/users", auth, admin, async (req, res) => {
  const skip = Number(req.query.skip || 0);
  const limit = Number(req.query.limit || 10);
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  res.json({ users, total });
});

module.exports = router;
