import { GoogleGenAI } from "@google/genai";
import Sermon from "../models/Sermon.js";
import ChatHistorySermon from "../models/chatHistorySermon.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SERMON_PROMPT_TEMPLATE = (topic) => `
Create an intimate and deeply exegetical sermon based on the following topic:
👉 ${topic}


Make it Spirit-filled, include relevant scriptures with clear explanations, 
practical applications, and Spirit-inspired insights. Suggest other related 
topics for further teaching. Ensure clarity, depth, prophetic richness, 
and alignment with biblical truth
`;

export const generateSermon = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: "Topic cannot be empty." });

    const userId = req.user?._id || null;
    const promptText = SERMON_PROMPT_TEMPLATE(topic.trim());

    // Save initial Sermon
    const sermonRecord = await Sermon.create({
      userId,
      topic: topic.trim(),
      promptSent: promptText,
      generated: ""
    });

    // Retry logic
    const MAX_RETRIES = 3;
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
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        } else throw err;
      }
    }

    // Extract AI text
    let generatedText = "No sermon generated.";
    if (aiResult?.text) generatedText = aiResult.text;
    else if (aiResult?.candidates?.[0]?.content?.[0]?.text)
      generatedText = aiResult.candidates[0].content[0].text;
    else if (typeof aiResult === "string") generatedText = aiResult;

    // Save generated sermon
    sermonRecord.generated = generatedText;
    await sermonRecord.save();

    // Save to chat history
    if (userId) {
      await ChatHistorySermon.create({
        user: userId,
        messages: [
          { sender: "user", text: topic.trim() },
          { sender: "ai", text: generatedText }
        ],
        context: "sermon-builder",
        referenceId: sermonRecord._id
      });
    }

    return res.json({ sermonId: sermonRecord._id, sermon: generatedText });

  } catch (err) {
    console.error("Sermon Builder Error:", err.response?.data || err);
    return res.status(500).json({ error: err.message || "AI service failed." });
  }
};


export const getSermonBuilderPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;

    let sermons = [];
    let history = [];

    if (user) {
      sermons = await Sermon.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

      history = await ChatHistorySermon.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      // Normalize messages for EJS
      history = history.map(h => ({
        messages: h.messages.map(m => ({
          sender: m.sender,
          text: m.text
        }))
      }));
    }

    res.render("features/sermon-builder", {
      user,
      message: null,
      sermons,
      messages: history,
      chatId: null // required to avoid undefined error
    });

  } catch (err) {
    console.error("Render Sermon Builder error:", err);
    res.render("features/sermon-builder", {
      user: null,
      message: "Error loading page.",
      sermons: [],
      messages: [],
      chatId: null
    });
  }
};

