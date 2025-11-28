import { GoogleGenAI } from "@google/genai";
import Model from "../models/videoScript.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateVideoScript = async (req, res) => {
  try {
    const { topic, style, duration } = req.body;

    const prompt = `
      Create an engaging video script.
      Topic: ${topic}
      Style: ${style}
      Target Duration: ${duration}
      Structure it clearly:
      - Hook
      - Introduction
      - Main Points
      - Call to Action
      Use simple language suitable for TikTok, Instagram Reels, and YouTube Shorts.
    `;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const aiResponse = await model.generateContent(prompt);

    const aiScript = aiResponse.response.text();

    const entry = await Model.create({
      topic,
      style,
      duration,
      aiScript,
    });

    const history = await Model.find().sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const clearScriptHistory = async (req, res) => {
  await Model.deleteMany({});
  res.json({ success: true });
};

export const renderVideoScriptPage = async (req, res) => {
const user = req.isAuthenticated() ? req.user : null;
  const history = await Model.find().sort({ createdAt: -1 });
  res.render("features/videoScript", { history, user });
};
