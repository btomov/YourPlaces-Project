const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pwChangeSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    identificationToken: { type: String, required: true },
    hashedToken: { type: String, required: true },
    createdAt: { type: Date, expires: 300 },
  },
  {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) },
  }
);

module.exports = mongoose.model("PwChangeRequest", pwChangeSchema);
