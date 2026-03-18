const express = require("express");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", auth, admin, async (_, res) => {
  const registrations = await Registration.find().populate("event").sort({ createdAt: -1 });
  res.json({ registrations });
});

router.get("/:id", auth, async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate("event");
  res.json({ registration });
});

module.exports = router;
