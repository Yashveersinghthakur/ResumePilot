import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  jobTitle: { type: String },
  company: { type: String },
  jobDescription: { type: String },
  atsScore: { type: Number, min: 0, max: 100 },
  matchedKeywords: [String],
  missingKeywords: [String],
  suggestions: [String],
  skillBreakdown: [
    {
      skill: String,
      percentage: Number,
      present: Boolean,
    },
  ],
  analyzedAt: { type: Date, default: Date.now },
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "My Resume" },
    fileName: { type: String },
    filePath: { type: String },
    rawText: { type: String },
    analyses: [analysisSchema],
    latestScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
