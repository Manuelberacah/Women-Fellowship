const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: String,
    endTime: String,
    fee: { type: Number, default: 200 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
