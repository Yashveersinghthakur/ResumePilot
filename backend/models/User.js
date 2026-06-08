import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    avatar: { type: String, default: "" },
    plan: {
      type: String,
      enum: ["starter", "pro", "teams"],
      default: "starter",
    },
    analysisCount: { type: Number, default: 0 },
    analysisResetDate: {
      type: Date,
      default: () => new Date(new Date().setDate(new Date().getDate() + 30)),
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* Hash password before save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* Compare passwords */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* Monthly analysis limit check */
userSchema.methods.canAnalyze = function () {
  const limits = { starter: 3, pro: Infinity, teams: Infinity };
  const now = new Date();
  if (now > this.analysisResetDate) {
    this.analysisCount = 0;
    this.analysisResetDate = new Date(now.setDate(now.getDate() + 30));
  }
  return this.analysisCount < limits[this.plan];
};

const User = mongoose.model("User", userSchema);
export default User;
