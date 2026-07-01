import Expense from "../models/Expense.js";

// ==============================
// Add Expense
// ==============================

export const addExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      paymentMethod,
      sourceAccountId,
      sourceAccountName,
      notes,
      date,
    } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      type,
      paymentMethod,
      sourceAccountId,
      sourceAccountName,
      notes,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      expense,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Get All Expenses
// ==============================

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// Update Expense
// ==============================

export const updateExpense = async (req, res) => {
  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    const {
      title,
      amount,
      category,
      type,
      paymentMethod,
      sourceAccountId,
      sourceAccountName,
      notes,
      date,
    } = req.body;

    Object.assign(expense, {
      title,
      amount,
      category,
      type,
      paymentMethod,
      sourceAccountId,
      sourceAccountName,
      notes,
      date,
    });

    await expense.save();

    res.json({
      success: true,
      message: "Expense updated successfully.",
      expense,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ==============================
// Delete Expense
// ==============================

export const deleteExpense = async (req, res) => {

  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });

    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: "Expense deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};