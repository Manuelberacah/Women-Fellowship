const express = require("express");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", auth, admin, async (req, res) => {
  const skip = Number(req.query.skip || 0);
  const limit = Number(req.query.limit || 10);
  const [registrations, total] = await Promise.all([
    Registration.find().populate("event").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Registration.countDocuments()
  ]);
  res.json({ registrations, total });
});

router.get("/:id", auth, async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate("event");
  res.json({ registration });
});

module.exports = router;
