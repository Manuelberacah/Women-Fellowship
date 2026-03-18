const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (_, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json({ events });
});

router.post("/", auth, admin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json({ event });
  } catch (error) {
    res.status(400).json({ message: "Unable to create event" });
  }
});

module.exports = router;
