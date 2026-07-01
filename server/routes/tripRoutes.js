import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
	createTrip,
	deleteTrip,
	addTripMessage,
	acceptTripInvite,
	generateTripGuide,
	getTripMessages,
	inviteTripMembers,
	getTrips,
	updateTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.get("/invites/:token/accept", acceptTripInvite);
router.route("/").get(protect, getTrips).post(protect, createTrip);
router.post("/:id/invite", protect, inviteTripMembers);
router.get("/:id/messages", protect, getTripMessages);
router.post("/:id/messages", protect, addTripMessage);
router.post("/:id/guide", protect, generateTripGuide);
router.route("/:id").put(protect, updateTrip).delete(protect, deleteTrip);

export default router;
