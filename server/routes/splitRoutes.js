import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
	createSplit,
	deleteSplit,
	getSplits,
	updateSplit,
} from "../controllers/splitController.js";

const router = express.Router();

router.route("/").get(protect, getSplits).post(protect, createSplit);
router.route("/:id").put(protect, updateSplit).delete(protect, deleteSplit);

export default router;
