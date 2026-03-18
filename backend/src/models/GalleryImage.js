const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    imageUrl: { type: String, required: true },
    uploadedBy: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryImage", gallerySchema);
