import express from "express";

const router = express.Router();

/* AI CHATBOT */
router.post("/", (req, res) => {
  const { message } = req.body;
  res.json({
    success: true,
    userMessage: message,
    aiResponse:
      "Improve your React project section by adding measurable achievements and technologies used.",
  });
});

export default router;
