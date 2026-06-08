import jwt from "jsonwebtoken";
import InterviewSession from "../models/InterviewSession.js";

const socketHandler = (io) => {
  /* ─── Socket Auth Middleware ─── */
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  /* ─── Socket Connection ─── */
  io.on("connection", (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);

    /* JOIN INTERVIEW ROOM */
    socket.on("join_interview", ({ sessionId }) => {
      socket.join(`interview:${sessionId}`);
      socket.emit("joined", { success: true, sessionId });
    });

    /* INTERVIEW MESSAGE */
    socket.on("interview_message", async ({ sessionId, message }) => {
      try {
        if (!message?.trim()) return;
        const session = await InterviewSession.findOne({
          _id: sessionId,
          user: socket.userId,
        });
        if (!session) {
          return socket.emit("error", { message: "Interview session not found" });
        }
        session.messages.push({ role: "user", content: message });
        const aiResponse = "This is a mock AI interview response from ResumePilot.";
        session.messages.push({ role: "assistant", content: aiResponse });
        await session.save();
        socket.emit("interview_response", {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        });
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to generate interview response" });
      }
    });

    /* END INTERVIEW */
    socket.on("end_interview", async ({ sessionId }) => {
      try {
        const session = await InterviewSession.findOne({
          _id: sessionId,
          user: socket.userId,
        });
        if (session) {
          session.status = "completed";
          await session.save();
          socket.emit("interview_ended", { success: true, sessionId });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to end interview session" });
      }
    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      console.log(`❌ User Disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
