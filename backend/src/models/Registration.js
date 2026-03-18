const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    attendeeName: { type: String, required: true },
    attendeeEmail: String,
    attendeePhone: String,
    paymentId: String,
    orderId: String,
    amount: Number,
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    passQr: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
