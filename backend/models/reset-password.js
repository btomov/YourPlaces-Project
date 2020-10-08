const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pwChangeSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    token: { type: String, required: true },
    createdAt: Number,
    updatedAt: Number,
  },
  {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) },
  }
);

module.exports = mongoose.model("PwChangeRequest", pwChangeSchema);
