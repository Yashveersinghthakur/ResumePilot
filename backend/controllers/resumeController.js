import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import { analyzeResume, generateCoverLetter } from "../utils/ai.js";

/* POST /api/resume/upload */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const { title } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    let rawText = "";
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text;
    } catch { rawText = ""; }
    const resume = await Resume.create({
      user: req.user._id,
      title: title || fileName.replace(/\.[^/.]+$/, ""),
      fileName,
      filePath,
      rawText,
    });
    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume: {
        _id: resume._id,
        title: resume.title,
        fileName: resume.fileName,
        createdAt: resume.createdAt,
        latestScore: resume.latestScore,
      },
    });
  } catch (err) { next(err); }
};

/* POST /api/resume/:id/analyze */
export const analyzeResumeById = async (req, res, next) => {
  try {
    const { jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Job description is required." });

    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });

    const user = await User.findById(req.user._id);
    if (!user.canAnalyze())
      return res.status(403).json({
        message: "You've reached your monthly analysis limit. Please upgrade to Pro for unlimited analyses.",
      });

    if (!resume.rawText)
      return res.status(400).json({ message: "Resume text could not be extracted. Please re-upload." });

    const result = await analyzeResume(resume.rawText, jobDescription, jobTitle, company);

    const analysis = {
      jobTitle: jobTitle || "",
      company: company || "",
      jobDescription,
      atsScore: result.atsScore,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
      skillBreakdown: result.skillBreakdown,
    };

    resume.analyses.push(analysis);
    resume.latestScore = result.atsScore;
    await resume.save();

    user.analysisCount += 1;
    await user.save();

    res.status(200).json({
      success: true,
      analysis: { ...analysis, summary: result.summary, analyzedAt: new Date() },
    });
  } catch (err) { next(err); }
};

/* GET /api/resume */
export const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id, isActive: true })
      .select("-rawText -filePath")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) { next(err); }
};

/* GET /api/resume/:id */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .select("-rawText -filePath");
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.status(200).json({ success: true, resume });
  } catch (err) { next(err); }
};

/* DELETE /api/resume/:id */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    resume.isActive = false;
    await resume.save();
    res.status(200).json({ success: true, message: "Resume deleted." });
  } catch (err) { next(err); }
};

/* POST /api/resume/:id/cover-letter */
export const generateCoverLetterForResume = async (req, res, next) => {
  try {
    const { jobDescription, jobTitle, company } = req.body;
    if (!jobDescription || !jobTitle)
      return res.status(400).json({ message: "Job description and title are required." });
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    if (!resume.rawText)
      return res.status(400).json({ message: "Resume text could not be extracted." });
    const coverLetter = await generateCoverLetter(
      resume.rawText,
      jobDescription,
      jobTitle,
      company || ""
    );
    res.status(200).json({ success: true, coverLetter });
  } catch (err) { next(err); }
};
