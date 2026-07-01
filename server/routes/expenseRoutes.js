import express from "express";
import protect from "../middleware/authMiddleware.js";
import { addExpense } from "../controllers/expenseController.js";
import { getExpenses  } from "../controllers/expenseController.js";
import { updateExpense  } from "../controllers/expenseController.js";
import { deleteExpense  } from "../controllers/expenseController.js";


const router = express.Router();

router.post("/", protect, addExpense);
router.get("/", protect, getExpenses);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);
export default router;