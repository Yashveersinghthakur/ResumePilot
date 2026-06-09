import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import socketHandler from "./config/socket.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import chatRoutes from "./routes/chat.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();
const httpServer = createServer(app);

/* ─── Socket.IO ─── */
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ─── Database ─── */
connectDB();

/* ─── Socket Handler ─── */
socketHandler(io);

/* ─── Middleware ─── */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ─── Root Route ─── */
app.get("/", (req, res) => {
  res.send("🚀 ResumePilot Backend is Running");
});

/* ─── API Routes ─── */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/chat", chatRoutes);

/* ─── Health Check ─── */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ResumePilot API running",
    timestamp: new Date().toISOString(),
  });
});

/* ─── Error Handler ─── */
app.use(errorHandler);

/* ─── Server Start ─── */
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});