import Expense from "../models/Expense.js";

export const getDashboard = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
    }).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryTotals = {};

    expenses.forEach((expense) => {
      if (expense.type === "Income") {
        totalIncome += expense.amount;
      } else {
        totalExpense += expense.amount;
      }

      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }

      categoryTotals[expense.category] += expense.amount;
    });

    const balance = totalIncome - totalExpense;

    const recentExpenses = expenses.slice(0, 5);

    const highestExpense =
      expenses.length > 0
        ? expenses.reduce((a, b) =>
            a.amount > b.amount ? a : b
          )
        : null;

    res.json({
      success: true,

      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactions: expenses.length,
      },

      recentExpenses,

      categoryBreakdown: categoryTotals,

      highestExpense,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};