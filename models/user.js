const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      unique: true,
      sparse: true, // Add this line
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Only required if not using Google
      },
    },
    googleId: {
      type: String,
    },
    photo: {
      type: String,
      default: "https://example.com/default-profile.png", // Default profile picture URL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);