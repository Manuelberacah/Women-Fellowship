const express = require("express");
const WallPost = require("../models/WallPost");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendNotification } = require("../utils/emailService");

const router = express.Router();

router.post("/", async (req, res) => {
  const post = await WallPost.create({ name: req.body.name, message: req.body.message });
  sendNotification({
    subject: "New Eureka Wall Submission",
    text: `Name: ${post.name}\nMessage: ${post.message}`
  }).catch(() => null);
  res.json({ post });
});

router.get("/", async (_, res) => {
  const posts = await WallPost.find({ approved: true }).sort({ createdAt: -1 });
  res.json({ posts });
});

router.get("/pending", auth, admin, async (_, res) => {
  const posts = await WallPost.find({ approved: false }).sort({ createdAt: -1 });
  res.json({ posts });
});

router.get("/all", auth, admin, async (_, res) => {
  const posts = await WallPost.find().sort({ createdAt: -1 });
  res.json({ posts });
});

router.patch("/:id", auth, admin, async (req, res) => {
  const post = await WallPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.approved === true && post) {
    sendNotification({
      subject: "Eureka Wall Post Approved",
      text: `Post by ${post.name} was approved.`
    }).catch(() => null);
  }
  res.json({ post });
});

router.delete("/:id", auth, admin, async (req, res) => {
  const post = await WallPost.findByIdAndDelete(req.params.id);
  res.json({ post });
});

module.exports = router;
