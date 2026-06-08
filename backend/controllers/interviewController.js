import InterviewSession from "../models/InterviewSession.js";
import { generateInterviewResponse } from "../utils/ai.js";

/* POST /api/interview/start */
export const startSession = async (req, res, next) => {
  try {
    const { jobTitle, company, jobDescription, difficulty } = req.body;
    if (!jobTitle) return res.status(400).json({ message: "Job title is required." });

    const session = await InterviewSession.create({
      user: req.user._id,
      jobTitle,
      company: company || "",
      jobDescription: jobDescription || "",
      difficulty: difficulty || "medium",
      messages: [],
    });

    const firstQuestion = await generateInterviewResponse(
      [],
      jobTitle,
      jobDescription || "",
      difficulty || "medium"
    );

    session.messages.push({ role: "assistant", content: firstQuestion });
    await session.save();

    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        jobTitle: session.jobTitle,
        company: session.company,
        difficulty: session.difficulty,
        messages: session.messages,
        status: session.status,
      },
    });
  } catch (err) { next(err); }
};

/* POST /api/interview/:id/message */
export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim())
      return res.status(400).json({ message: "Message content is required." });

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });
    if (!session) return res.status(404).json({ message: "Active interview session not found." });

    session.messages.push({ role: "user", content: message.trim() });

    const conversationHistory = session.messages.map(({ role, content }) => ({ role, content }));
    const aiResponse = await generateInterviewResponse(
      conversationHistory,
      session.jobTitle,
      session.jobDescription,
      session.difficulty
    );

    session.messages.push({ role: "assistant", content: aiResponse });
    await session.save();

    res.status(200).json({ success: true, message: { role: "assistant", content: aiResponse } });
  } catch (err) { next(err); }
};

/* PUT /api/interview/:id/end */
export const endSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found." });

    session.status = "completed";

    if (session.messages.length >= 2) {
      const start = session.messages[0].timestamp;
      const end = session.messages[session.messages.length - 1].timestamp;
      session.duration = Math.floor((new Date(end) - new Date(start)) / 1000);
    }

    if (session.messages.length > 2) {
      const conversationHistory = session.messages.map(({ role, content }) => ({ role, content }));
      conversationHistory.push({
        role: "user",
        content:
          "Please provide a final performance review with: overall score out of 10, 2-3 strengths, 2-3 areas for improvement, and a brief summary. Format as JSON: { overallScore, strengths, improvements, summary }",
      });
      try {
        const feedbackRaw = await generateInterviewResponse(
          conversationHistory,
          session.jobTitle,
          session.jobDescription,
          session.difficulty
        );
        const jsonMatch = feedbackRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) session.feedback = JSON.parse(jsonMatch[0]);
      } catch { /* Non-critical */ }
    }

    await session.save();

    res.status(200).json({
      success: true,
      session: {
        _id: session._id,
        status: session.status,
        duration: session.duration,
        feedback: session.feedback,
        messageCount: session.messages.length,
      },
    });
  } catch (err) { next(err); }
};

/* GET /api/interview */
export const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .select("-messages")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (err) { next(err); }
};

/* GET /api/interview/:id */
export const getSessionById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found." });
    res.status(200).json({ success: true, session });
  } catch (err) { next(err); }
};
