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

  try {
    const uploadsDir = path.join(__dirname, "..", "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `gallery_${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer).resize(1400).jpeg({ quality: 80 }).toFile(outputPath);

    const imageUrl = `/uploads/${filename}`;
    const image = await GalleryImage.create({ imageUrl, title: req.body.title || "" });

    res.json({ image });
  } catch (error) {
    console.error("Gallery upload failed:", error?.message || error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Try to delete the file from disk
    if (image.imageUrl?.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", "..", image.imageUrl);
      fs.unlink(filePath, () => {});
    }

    res.json({ message: "Deleted", image });
  } catch (error) {
    console.error("Gallery delete failed:", error?.message || error);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
