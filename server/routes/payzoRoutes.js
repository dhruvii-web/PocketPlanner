import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
	createConnection,
	createTransaction,
	deleteConnection,
	acceptConnectionInvite,
	getConnections,
	getPaymentStatus,
	getTransactions,
	resendConnectionInvite,
} from "../controllers/payzoController.js";

const router = express.Router();

router.get("/invite/:token/accept", acceptConnectionInvite);
router.get("/status", protect, getPaymentStatus);
router.get("/connections", protect, getConnections);
router.post("/connections", protect, createConnection);
router.post("/connections/:id/resend", protect, resendConnectionInvite);
router.delete("/connections/:id", protect, deleteConnection);
router.get("/transactions", protect, getTransactions);
router.post("/transactions", protect, createTransaction);

export default router;
