import Expense from "../models/Expense.js";

export const getAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
      type: "Expense",
    });

    const monthly = {};

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleString(
        "default",
        {
          month: "short",
        }
      );

      monthly[month] =
        (monthly[month] || 0) + expense.amount;
    });

    res.json({
      success: true,
      monthly,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};