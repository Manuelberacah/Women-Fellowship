const express = require("express");
const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (_, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json({ announcements });
});

router.post("/", auth, admin, async (req, res) => {
  const announcement = await Announcement.create(req.body);
  res.json({ announcement });
});

module.exports = router;
