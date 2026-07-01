import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    members: {
      type: [String],
      default: [],
    },

    expenses: {
      type: Array,
      default: [],
    },

    settlements: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Split", splitSchema);