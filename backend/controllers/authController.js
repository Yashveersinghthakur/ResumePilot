import User from "../models/User.js";
import { sendTokenResponse } from "../utils/token.js";

/* POST /api/auth/signup */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please provide name, email, and password." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

/* POST /api/auth/login */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password." });
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

/* GET /api/auth/me */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

/* PUT /api/auth/update-profile */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

/* PUT /api/auth/change-password */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Provide current and new password." });
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (err) { next(err); }
};
