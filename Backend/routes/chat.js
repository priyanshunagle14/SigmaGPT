import express from "express";
import Thread from "../models/Thread.js";
import { getLocalAIResponse } from "../utils/localAi.js";

const router = express.Router();

// Post a message
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) return res.status(400).json({ error: "Missing required fields" });

  try {
    let thread = await Thread.findOne({ threadId });
    if (!thread) {
      thread = new Thread({ threadId, title: message, messages: [{ role: "user", content: message }] });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getLocalAIResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find().sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single thread messages
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({ threadId: req.params.threadId });
    res.json(thread ? thread.messages : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    await Thread.findOneAndDelete({ threadId: req.params.threadId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;