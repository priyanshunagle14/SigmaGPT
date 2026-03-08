import express from "express";
import Thread from "../models/Thread.js";
import { getLocalAIResponse } from "../utils/localAi.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Post a message
router.post("/chat", verifyToken, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) return res.status(400).json({ error: "Missing required fields" });

  // Guest mode - don't save to DB
  if (!req.userId) {
    const assistantReply = await getLocalAIResponse(message);
    return res.json({ reply: assistantReply });
  }

  try {
    let thread = await Thread.findOne({ threadId });
    if (!thread) {
      thread = new Thread({ threadId, title: message, messages: [{ role: "user", content: message }], userId: req.userId });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const history = thread.messages.map(m => ({ role: m.role, content: m.content }));
    const assistantReply = await getLocalAIResponse(message, history);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all threads (logged in only)
router.get("/thread", verifyToken, async (req, res) => {
  if (!req.userId) return res.json([]);
  try {
    const threads = await Thread.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single thread messages
router.get("/thread/:threadId", verifyToken, async (req, res) => {
  if (!req.userId) return res.json([]);
  try {
    const thread = await Thread.findOne({ threadId: req.params.threadId, userId: req.userId });
    res.json(thread ? thread.messages : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete thread
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
  if (!req.userId) return res.json({ success: false });
  try {
    await Thread.findOneAndDelete({ threadId: req.params.threadId, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;