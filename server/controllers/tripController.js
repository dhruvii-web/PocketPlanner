import Trip from "../models/Trip.js";
import crypto from "crypto";
import TripInvite from "../models/TripInvite.js";
import TripMessage from "../models/TripMessage.js";
import { getPublicAppUrl, sendSms } from "../services/smsService.js";
import { generatePocketGuideReply } from "../services/pocketGuideService.js";

const parseInvitees = (invitees) => {
  if (!Array.isArray(invitees)) {
    return [];
  }

  return invitees
    .map((invitee) => ({
      name: invitee?.name?.trim?.() || "",
      phone: invitee?.phone?.trim?.() || "",
      role: invitee?.role?.trim?.() || "member",
    }))
    .filter((invitee) => invitee.name && invitee.phone);
};

const createInviteMessage = ({ trip, invitee, inviteUrl }) => {
  return `Pocket Planner trip invite from Dhruviibh: ${trip.name} to ${trip.destination}. ${invitee.name}, you were invited to join the group plan. Open this link to accept: ${inviteUrl}`;
};

export const getTrips = async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: trips.length,
    trips,
  });
};

export const createTrip = async (req, res) => {
  const invitees = parseInvitees(req.body.invitees);
  const inviteToken = crypto.randomUUID();

  const trip = await Trip.create({
    user: req.user._id,
    ...req.body,
    groupName: req.body.groupName || req.body.name || "",
    isGroupTrip: Boolean(req.body.isGroupTrip || invitees.length > 0),
    inviteToken,
    participants: req.body.participants || [],
    invites: invitees,
    chatEnabled: true,
  });

  const createdInvites = [];

  for (const invitee of invitees) {
    const tripInviteToken = crypto.randomUUID();
    const inviteUrl = `${getPublicAppUrl()}/api/trips/invites/${tripInviteToken}/accept`;
    const inviteMessage = createInviteMessage({ trip, invitee, inviteUrl });

    let smsStatus = "queued";

    try {
      const smsResult = await sendSms({
        to: invitee.phone,
        body: inviteMessage,
      });
      smsStatus = smsResult.delivered ? "sent" : "queued";
    } catch (error) {
      smsStatus = "failed";
    }

    const tripInvite = await TripInvite.create({
      trip: trip._id,
      inviter: req.user._id,
      name: invitee.name,
      phone: invitee.phone,
      role: invitee.role,
      inviteToken: tripInviteToken,
      status: smsStatus === "failed" ? "failed" : "sent",
      smsStatus,
      inviteMessage,
    });

    createdInvites.push(tripInvite);
  }

  res.status(201).json({
    success: true,
    message: "Trip created successfully.",
    trip,
    invites: createdInvites,
  });
};

export const updateTrip = async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  res.json({
    success: true,
    message: "Trip updated successfully.",
    trip,
  });
};

export const deleteTrip = async (req, res) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  res.json({
    success: true,
    message: "Trip deleted successfully.",
  });
};

export const inviteTripMembers = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const invitees = parseInvitees(req.body.invitees);
  const createdInvites = [];

  for (const invitee of invitees) {
    const tripInviteToken = crypto.randomUUID();
    const inviteUrl = `${getPublicAppUrl()}/api/trips/invites/${tripInviteToken}/accept`;
    const inviteMessage = createInviteMessage({ trip, invitee, inviteUrl });

    let smsStatus = "queued";

    try {
      const smsResult = await sendSms({
        to: invitee.phone,
        body: inviteMessage,
      });
      smsStatus = smsResult.delivered ? "sent" : "queued";
    } catch (error) {
      smsStatus = "failed";
    }

    const tripInvite = await TripInvite.create({
      trip: trip._id,
      inviter: req.user._id,
      name: invitee.name,
      phone: invitee.phone,
      role: invitee.role,
      inviteToken: tripInviteToken,
      status: smsStatus === "failed" ? "failed" : "sent",
      smsStatus,
      inviteMessage,
    });

    createdInvites.push(tripInvite);
  }

  res.json({
    success: true,
    message: "Trip invites processed.",
    invites: createdInvites,
  });
};

export const acceptTripInvite = async (req, res) => {
  const tripInvite = await TripInvite.findOne({ inviteToken: req.params.token });

  if (!tripInvite) {
    return res.status(404).json({
      success: false,
      message: "Trip invite not found.",
    });
  }

  tripInvite.status = "accepted";
  tripInvite.acceptedAt = new Date();
  await tripInvite.save();

  await Trip.findByIdAndUpdate(tripInvite.trip, {
    $addToSet: {
      participants: {
        name: tripInvite.name,
        phone: tripInvite.phone,
        role: tripInvite.role,
        acceptedAt: tripInvite.acceptedAt,
      },
    },
  });

  res.json({
    success: true,
    message: "Trip invite accepted.",
    tripInvite,
  });
};

export const getTripMessages = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const messages = await TripMessage.find({ trip: trip._id }).sort({ createdAt: 1 });

  res.json({
    success: true,
    count: messages.length,
    messages,
  });
};

export const addTripMessage = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const { senderName, content, senderPhone = "", messageType = "text" } = req.body;

  if (!senderName || !content) {
    return res.status(400).json({
      success: false,
      message: "senderName and content are required.",
    });
  }

  const message = await TripMessage.create({
    trip: trip._id,
    senderUser: req.user._id,
    senderName,
    senderPhone,
    content,
    messageType,
  });

  res.status(201).json({
    success: true,
    message,
  });
};

export const generateTripGuide = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const { prompt = "Help me plan this trip." } = req.body;

  const messages = await TripMessage.find({ trip: trip._id }).sort({ createdAt: -1 }).limit(12);

  const response = await generatePocketGuideReply({
    trip,
    messages: messages.reverse(),
    prompt,
  });

  await TripMessage.create({
    trip: trip._id,
    senderUser: req.user._id,
    senderName: "PocketGuide",
    content: response,
    messageType: "ai",
  });

  res.json({
    success: true,
    response,
  });
};