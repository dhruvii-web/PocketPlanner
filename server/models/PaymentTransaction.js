import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentConnection",
      default: null,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    connectionId: {
      type: String,
      default: "",
    },

    connectionName: {
      type: String,
      default: "",
    },

    permissionLevel: {
      type: String,
      default: "full",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    sender: {
      type: String,
      default: "",
    },

    receiver: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["send", "request"],
      default: "send",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    direction: {
      type: String,
      enum: ["debit", "credit", "transfer", "request"],
      default: "debit",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["initiated", "pending", "completed", "failed", "cancelled"],
      default: "initiated",
    },

    externalId: {
      type: String,
      default: "",
      trim: true,
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

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);