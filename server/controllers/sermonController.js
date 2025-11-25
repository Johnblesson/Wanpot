import { GoogleGenAI } from "@google/genai";
import Sermon from "../models/Sermon.js";
import ChatHistorySermon from "../models/chatHistorySermon.js"; // optional if you want to reuse chat history
// import sanitizeHtml from "sanitize-html"; // optional, install if you want to sanitize

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The sermon prompt template (we'll fill in the topic)
const SERMON_PROMPT_TEMPLATE = (topic) => `
Create an intimate and deeply exegetical sermon based on the following topic
👉 ${topic}

Make it Spirit-filled, include relevant scriptures with clear explanations, 
practical applications, and Spirit-inspired insights. Suggest other related 
topics for further teaching. Ensure clarity, depth, prophetic richness, 
and alignment with biblical truth
`;

// POST run
export const generateSermon = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: "Topic cannot be empty." });
    }

    const userId = req.user?._id || null;
    const promptText = SERMON_PROMPT_TEMPLATE(topic.trim());

    // Save initial request
    const sermonRecord = await Sermon.create({
      userId,
      topic: topic.trim(),
      promptSent: promptText,
      generated: ""
    });

    // Retry logic
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    let aiResult = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        aiResult = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText
        });
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if ((status === 503 || status === 429) && attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)));
          continue;
        } else {
          throw err;
        }
      }
    }

    // Extract text
    let generatedText = "No sermon generated.";
    if (aiResult?.text) generatedText = aiResult.text;
    else if (aiResult?.candidates?.[0]?.content?.[0]?.text)
      generatedText = aiResult.candidates[0].content[0].text;
    else if (typeof aiResult === "string") generatedText = aiResult;

    // Save sermon output
    sermonRecord.generated = generatedText;
    await sermonRecord.save();

    // ⭐ SAVE TO CHAT HISTORY ⭐
    if (userId) {
      const historyEntry = new ChatHistorySermon({
        userId,
        messages: [
          { sender: "user", text: topic.trim(), timestamp: new Date() },
          { sender: "ai", text: generatedText, timestamp: new Date() },
        ],
        context: "sermon-builder", // optional tag
        referenceId: sermonRecord._id,
      });

      await historyEntry.save();
    }

    // Respond
    return res.json({
      sermonId: sermonRecord._id,
      sermon: generatedText
    });

  } catch (err) {
    console.error("Sermon Builder Error:", err.response?.data || err);
    const message = err.response?.data?.error?.message || err.message || "AI service failed.";
    return res.status(500).json({ error: message });
  }
};

// GET Sermon Builder Page
export const getSermonBuilderPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;

    let sermons = [];
    let history = [];

    if (user) {
      sermons = await Sermon.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .lean();

      history = await ChatHistorySermon.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      history = history.map(h => ({
        messages: h.messages.map(m => ({
          sender: m.role || m.sender,
          text: m.content || m.text
        }))
      }));
    }

    res.render("features/sermon-builder", {
      user,
      message: null,
      sermons,
      messages: history,
      chatId: null   // <---- IMPORTANT FIX
    });

  } catch (err) {
    console.error("Render Sermon Builder error:", err);

    res.render("features/sermon-builder", {
      user: null,
      message: "Error loading page.",
      sermons: [],
      messages: [],
      chatId: null  // <---- ALSO REQUIRED HERE
    });
  }
};
