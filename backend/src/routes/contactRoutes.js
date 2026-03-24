const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const { sendNotification } = require("../utils/emailService");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await ContactMessage.create({ name, email, message });
    sendNotification({
      subject: "New Contact Message",
      text: `Name: ${contact.name}\nEmail: ${contact.email}\nMessage: ${contact.message}`
    }).catch(() => null);
    res.json({ contact });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit contact message" });
  }
});

router.get("/", auth, admin, async (req, res) => {
  const skip = Number(req.query.skip || 0);
  const limit = Number(req.query.limit || 10);
  const [contacts, total] = await Promise.all([
    ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments()
  ]);
  res.json({ contacts, total });
});

router.patch("/:id/read", auth, admin, async (req, res) => {
  const contact = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json({ contact });
});

module.exports = router;
