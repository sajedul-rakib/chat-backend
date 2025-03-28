const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      required: true,
    },
    profilePic: { type: String, default: "" },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    fcmToken: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
