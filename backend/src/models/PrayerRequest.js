const mongoose = require("mongoose");

const prayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    request: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "prayed"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrayerRequest", prayerSchema);
