import mongoose from "mongoose";

const checklistSchema = new mongoose.Schema(
  {
    passport: { type: Boolean, default: false },
    visa: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    flights: { type: Boolean, default: false },
    hotels: { type: Boolean, default: false },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    travellers: {
      type: Number,
      required: true,
      min: 1,
    },

    startDate: {
      type: String,
      default: "",
    },

    groupName: {
      type: String,
      default: "",
      trim: true,
    },

    isGroupTrip: {
      type: Boolean,
      default: false,
    },

    inviteToken: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
    },

    participants: {
      type: Array,
      default: [],
    },

    invites: {
      type: Array,
      default: [],
    },

    chatEnabled: {
      type: Boolean,
      default: true,
    },

    itinerary: {
      type: Array,
      default: [],
    },

    checklist: {
      type: checklistSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      default: "Planning",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trip", tripSchema);