const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const GalleryImage = require("../models/GalleryImage");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", async (_, res) => {
  const images = await GalleryImage.find().sort({ createdAt: -1 });
  res.json({ images });
});

router.post("/", auth, admin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image required" });

  const filename = `gallery_${Date.now()}.jpg`;
  const outputPath = path.join(__dirname, "..", "..", "uploads", filename);

  await sharp(req.file.buffer).resize(1400).jpeg({ quality: 80 }).toFile(outputPath);

  const imageUrl = `/uploads/${filename}`;
  const image = await GalleryImage.create({ imageUrl, title: req.body.title || "" });

  res.json({ image });
});

module.exports = router;
