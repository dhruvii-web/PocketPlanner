import mongoose from "mongoose";

const paymentConnectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    relation: {
      type: String,
      default: "parent",
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    permissionStatus: {
      type: String,
      enum: ["sent", "pending", "approved", "denied"],
      default: "sent",
    },

    inviteToken: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
    },

    inviteMessage: {
      type: String,
      default: "",
    },

    smsStatus: {
      type: String,
      enum: ["not_sent", "queued", "sent", "failed"],
      default: "not_sent",
    },

    invitedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    connectionType: {
      type: String,
      default: "family",
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    institutionName: {
      type: String,
      default: "",
      trim: true,
    },

    last4: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["connected", "pending", "disabled", "error"],
      default: "pending",
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

paymentConnectionSchema.index({ user: 1, provider: 1, externalId: 1 }, { unique: true, sparse: true });

export default mongoose.model("PaymentConnection", paymentConnectionSchema);