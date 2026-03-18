const mongoose = require("mongoose");

const wallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    message: { type: String, required: true },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WallPost", wallSchema);
