const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    churchName: { type: String, required: true },
    city: { type: String, required: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
