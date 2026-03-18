const express = require("express");
const PrayerRequest = require("../models/PrayerRequest");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendNotification } = require("../utils/emailService");

const router = express.Router();

router.post("/", async (req, res) => {
  const prayer = await PrayerRequest.create({ name: req.body.name, request: req.body.request });
  sendNotification({
    subject: "New Prayer Request",
    text: `Name: ${prayer.name}\nRequest: ${prayer.request}`
  }).catch(() => null);
  res.json({ prayer });
});

router.get("/", auth, admin, async (_, res) => {
  const prayers = await PrayerRequest.find().sort({ createdAt: -1 });
  res.json({ prayers });
});

router.patch("/:id", auth, admin, async (req, res) => {
  const prayer = await PrayerRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.status && prayer) {
    sendNotification({
      subject: "Prayer Request Updated",
      text: `Prayer request from ${prayer.name} marked as ${prayer.status}.`
    }).catch(() => null);
  }
  res.json({ prayer });
});

module.exports = router;
