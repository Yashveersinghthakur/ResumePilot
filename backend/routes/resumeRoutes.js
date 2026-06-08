import express from "express";
import {
  uploadResume,
  analyzeResumeById,
  getUserResumes,
  getResumeById,
  deleteResume,
  generateCoverLetterForResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserResumes);
router.post("/upload", upload.single("resume"), uploadResume);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);
router.post("/:id/analyze", analyzeResumeById);
router.post("/:id/cover-letter", generateCoverLetterForResume);

export default router;
