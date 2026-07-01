import Split from "../models/Split.js";

export const getSplits = async (req, res) => {
  const splits = await Split.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: splits.length,
    splits,
  });
};

export const createSplit = async (req, res) => {
  const split = await Split.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Split group created successfully.",
    split,
  });
};

export const updateSplit = async (req, res) => {
  const split = await Split.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!split) {
    return res.status(404).json({
      success: false,
      message: "Split not found.",
    });
  }

  res.json({
    success: true,
    message: "Split updated successfully.",
    split,
  });
};

export const deleteSplit = async (req, res) => {
  const split = await Split.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!split) {
    return res.status(404).json({
      success: false,
      message: "Split not found.",
    });
  }

  res.json({
    success: true,
    message: "Split deleted successfully.",
  });
};