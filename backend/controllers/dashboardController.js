import Resume from "../models/Resume.js";
import InterviewSession from "../models/InterviewSession.js";
import User from "../models/User.js";

/* GET /api/dashboard */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [resumes, sessions, user] = await Promise.all([
      Resume.find({ user: userId, isActive: true })
        .select("-rawText -filePath")
        .sort({ createdAt: -1 }),
      InterviewSession.find({ user: userId })
        .select("-messages")
        .sort({ createdAt: -1 })
        .limit(5),
      User.findById(userId),
    ]);

    const allScores = resumes.flatMap((r) => r.analyses.map((a) => a.atsScore)).filter(Boolean);
    const avgScore = allScores.length
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;
    const bestScore = allScores.length ? Math.max(...allScores) : 0;

    const completedSessions = sessions.filter((s) => s.status === "completed");
    const avgInterviewScore = completedSessions.length
      ? Math.round(
          completedSessions
            .filter((s) => s.feedback?.overallScore)
            .reduce((a, b) => a + (b.feedback?.overallScore || 0), 0) /
            (completedSessions.filter((s) => s.feedback?.overallScore).length || 1)
        )
      : 0;

    const planLimits = { starter: 3, pro: Infinity, teams: Infinity };
    const analysesLeft =
      user.plan === "starter"
        ? Math.max(0, planLimits[user.plan] - user.analysisCount)
        : "Unlimited";

    res.status(200).json({
      success: true,
      stats: {
        totalResumes: resumes.length,
        totalAnalyses: allScores.length,
        avgAtsScore: avgScore,
        bestAtsScore: bestScore,
        totalInterviews: sessions.length,
        completedInterviews: completedSessions.length,
        avgInterviewScore,
        analysesLeft,
        plan: user.plan,
      },
      recentResumes: resumes.slice(0, 5),
      recentSessions: sessions,
    });
  } catch (err) { next(err); }
};
