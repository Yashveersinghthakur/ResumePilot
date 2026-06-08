import express from "express";
import {
  startSession,
  sendMessage,
  endSession,
  getUserSessions,
  getSessionById,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserSessions);
router.post("/start", startSession);
router.get("/:id", getSessionById);
router.post("/:id/message", sendMessage);
router.put("/:id/end", endSession);

export default router;
