import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    currency: {
      type: String,
      default: "INR",
    },

    country: {
      type: String,
      default: "India",
    },

    language: {
      type: String,
      default: "English",
    },

    theme: {
      type: String,
      default: "light",
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    pocketCoins: {
      type: Number,
      default: 0,
    },

    // AI Memory
    pocketGuideMemory: {
      type: Object,
      default: {},
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);