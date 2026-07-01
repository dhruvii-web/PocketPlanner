import User from "../models/User.js";

// Get Profile
export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "profilePicture",
      "phone",
      "currency",
      "country",
      "language",
      "theme",
      "notifications",
      "pocketGuideMemory",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "password")) {
      return res.status(400).json({
        success: false,
        message: "Password changes must use the dedicated password flow.",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields were provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};