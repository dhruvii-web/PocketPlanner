import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
	createGoal,
	deleteGoal,
	getGoals,
	updateGoal,
} from "../controllers/goalController.js";

const router = express.Router();

router.route("/").get(protect, getGoals).post(protect, createGoal);
router.route("/:id").put(protect, updateGoal).delete(protect, deleteGoal);

export default router;
