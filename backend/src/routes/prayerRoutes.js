const express = require("express");
const PrayerRequest = require("../models/PrayerRequest");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendNotification, sendPrayerDoneEmail } = require("../utils/emailService");

const router = express.Router();

router.post("/", async (req, res) => {
  const prayer = await PrayerRequest.create({
    name: req.body.name,
    email: req.body.email,
    request: req.body.request
  });
  sendNotification({
    subject: "New Prayer Request",
    text: `Name: ${prayer.name}\nEmail: ${prayer.email || "-"}\nRequest: ${prayer.request}`
  }).catch(() => null);
  res.json({ prayer });
});

router.get("/", auth, admin, async (req, res) => {
  const skip = Number(req.query.skip || 0);
  const limit = Number(req.query.limit || 10);
  const [prayers, total] = await Promise.all([
    PrayerRequest.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    PrayerRequest.countDocuments()
  ]);
  res.json({ prayers, total });
});

router.patch("/:id", auth, admin, async (req, res) => {
  const prayer = await PrayerRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.status === "prayed" && prayer) {
    sendNotification({
      subject: "Prayer Request Marked as Prayed",
      text: `Prayer request from ${prayer.name} has been prayed for.`
    }).catch(() => null);

    if (prayer.email) {
      sendPrayerDoneEmail(prayer.email, prayer.name).catch(() => null);
    }
  }
  res.json({ prayer });
});

module.exports = router;
