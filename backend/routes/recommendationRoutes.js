import express from "express";

const router = express.Router();

/* GET JOB RECOMMENDATIONS */
router.get("/recommend", (req, res) => {
  res.json({
    success: true,
    recommendations: [
      { role: "Frontend Developer", match: "92%" },
      { role: "MERN Stack Developer", match: "88%" },
      { role: "React Intern", match: "84%" },
    ],
  });
});

export default router;
