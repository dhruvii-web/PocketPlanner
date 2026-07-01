import mongoose from "mongoose";

const tripInviteSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      default: "member",
      trim: true,
    },

    inviteToken: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "accepted", "failed"],
      default: "pending",
    },

    smsStatus: {
      type: String,
      enum: ["queued", "sent", "failed", "not_sent"],
      default: "queued",
    },

    inviteMessage: {
      type: String,
      default: "",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TripInvite", tripInviteSchema);