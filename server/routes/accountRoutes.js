import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../controllers/accountController.js";

const router = express.Router();

router.route("/").get(protect, getAccounts).post(protect, createAccount);
router.route("/:id").put(protect, updateAccount).delete(protect, deleteAccount);

export default router;