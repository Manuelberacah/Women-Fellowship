require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const prayerRoutes = require("./routes/prayerRoutes");
const wallRoutes = require("./routes/wallRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!allowedOrigins.length || allowedOrigins.includes("*")) return true;
  if (!origin) return true;
  const normalize = (value) => value.replace(/\/+$/, "");
  return allowedOrigins.some((allowed) => normalize(allowed) === normalize(origin));
};
app.use(
  cors({
    origin: (origin, callback) => {
      const ok = isOriginAllowed(origin);
      // Don't throw; just disallow so the request fails cleanly.
      callback(null, ok);
    }
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/prayers", prayerRoutes);
app.use("/api/wall", wallRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
