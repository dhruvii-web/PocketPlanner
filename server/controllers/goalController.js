import Goal from "../models/Goal.js";

export const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: goals.length,
    goals,
  });
};

export const createGoal = async (req, res) => {
  const goal = await Goal.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Goal created successfully.",
    goal,
  });
};

export const updateGoal = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found.",
    });
  }

  res.json({
    success: true,
    message: "Goal updated successfully.",
    goal,
  });
};

export const deleteGoal = async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found.",
    });
  }

  res.json({
    success: true,
    message: "Goal deleted successfully.",
  });
};