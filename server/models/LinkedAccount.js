import mongoose from "mongoose";

const linkedAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountType: {
      type: String,
      required: true,
      enum: ["bank", "credit_card", "debit_card"],
    },

    provider: {
      type: String,
      default: "manual",
      trim: true,
      lowercase: true,
    },

    institutionName: {
      type: String,
      required: true,
      trim: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    last4: {
      type: String,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["connected", "pending", "disconnected"],
      default: "connected",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LinkedAccount", linkedAccountSchema);