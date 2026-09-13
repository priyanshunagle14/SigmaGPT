import express from "express";
import Thread from "../models/Thread.js";
import { getLocalAIResponse, streamLocalAIResponse } from "../utils/localAi.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Helper to generate clean thread titles (truncate first line or up to 40 chars)
const formatTitle = (text) => {
  const clean = text.trim().split("\n")[0];
  return clean.length > 42 ? clean.substring(0, 42) + "..." : clean;
};

// Streaming Chat Endpoint (NEW - Real-time responses like ChatGPT)
router.post("/chat/stream", verifyToken, async (req, res) => {
  const { threadId, message, model } = req.body;
  if (!threadId || !message) return res.status(400).json({ error: "Missing required fields" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    let thread = null;
    let history = [];

    if (req.userId) {
      thread = await Thread.findOne({ threadId, userId: req.userId });
      if (!thread) {
        thread = new Thread({
          threadId,
          title: formatTitle(message),
          messages: [{ role: "user", content: message }],
          userId: req.userId
        });
      } else {
        thread.messages.push({ role: "user", content: message });
      }
      history = thread.messages.map(m => ({ role: m.role, content: m.content }));
    } else {
      history = req.body.history || [];
    }

    let fullResponse = "";

    // Stream the response
    for await (const chunk of streamLocalAIResponse(message, history, model)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Save to database if logged in
    if (req.userId && thread) {
      thread.messages.push({ role: "assistant", content: fullResponse });
      thread.updatedAt = new Date();
      await thread.save();
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (err) {
    console.error("Streaming chat error:", err);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
    res.end();
  }
});

// Post a message (original non-streaming endpoint)
router.post("/chat", verifyToken, async (req, res) => {
  const { threadId, message, model } = req.body;
  if (!threadId || !message) return res.status(400).json({ error: "Missing required fields" });

  // Guest mode - don't save to DB, but support history if passed
  if (!req.userId) {
    const history = req.body.history || [];
    const assistantReply = await getLocalAIResponse(message, history, model);
    return res.json({ reply: assistantReply });
  }

  try {
    let thread = await Thread.findOne({ threadId, userId: req.userId });
    if (!thread) {
      thread = new Thread({
        threadId,
        title: formatTitle(message),
        messages: [{ role: "user", content: message }],
        userId: req.userId
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const history = thread.messages.map(m => ({ role: m.role, content: m.content }));
    const assistantReply = await getLocalAIResponse(message, history, model);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });

  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ error: "Something went wrong processing your request" });
  }
});

// Get all threads (logged in only)
router.get("/thread", verifyToken, async (req, res) => {
  if (!req.userId) return res.json([]);
  try {
    const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1, createdAt: -1 });
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

// Rename thread
router.patch("/thread/:threadId", verifyToken, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const thread = await Thread.findOneAndUpdate(
      { threadId: req.params.threadId, userId: req.userId },
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    res.json({ success: true, thread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single thread
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
  if (!req.userId) return res.json({ success: false });
  try {
    await Thread.findOneAndDelete({ threadId: req.params.threadId, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all user threads (Settings action)
router.delete("/thread", verifyToken, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    await Thread.deleteMany({ userId: req.userId });
    res.json({ success: true, message: "All conversations cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;