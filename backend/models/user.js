const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
  isAdmin: { type: Boolean, default: false },
  temporarytoken: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true, default: false },
  resetPasswordRequests: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "PwChangeRequest",
    },
  ],
  favouritePlaces: [{ type: String }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
