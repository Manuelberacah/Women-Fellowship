const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    scheduledFor: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
