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

router.get("/", auth, admin, async (_, res) => {
  const contacts = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ contacts });
});

module.exports = router;
