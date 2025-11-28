// controllers/careerCoachController.js
import { GoogleGenAI } from "@google/genai";
import CareerCoachHistory from "../models/CareerCoachHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render page
export const renderCareerCoach = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const history = user
    ? await CareerCoachHistory.find({ userId: user._id }).sort({ createdAt: -1 })
    : [];

  res.render("features/careerCoach", {
    pageTitle: "Wanpot | AI Career Coach",
    history,
    user
  });
};

// Process prompt
export const careerCoachPrompt = async (req, res) => {
  try {
    const promptText = req.body.prompt?.trim();
    if (!promptText) return res.status(400).json({ error: "Please provide a prompt." });

    const fullPrompt = `
      You are an expert Career Coach and Mentor.
      Provide guidance, skill recommendations, career roadmap suggestions, and actionable advice
      based on the user's prompt:
      ${promptText}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });

    const responseText = result.response?.text() || "No response generated.";

    // Save to DB if user logged in
    let historyRecord = null;
    if (req.isAuthenticated()) {
      historyRecord = await CareerCoachHistory.create({
        userId: req.user._id,
        prompt: promptText,
        response: responseText
      });
    }

    res.json({
      success: true,
      response: responseText,
      history: req.isAuthenticated()
        ? await CareerCoachHistory.find({ userId: req.user._id }).sort({ createdAt: -1 })
        : [],
    });

  } catch (err) {
    console.error("Career Coach Error:", err);
    res.status(500).json({ error: "Failed to get career guidance." });
  }
};

// Clear history
export const clearCareerCoachHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await CareerCoachHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history." });
  }
};
