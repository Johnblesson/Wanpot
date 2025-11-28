// controllers/emailComposerController.js
import { GoogleGenAI } from "@google/genai";
import EmailComposerHistory from "../models/EmailComposerHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render page
export const renderEmailComposer = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const history = user
    ? await EmailComposerHistory.find({ userId: user._id }).sort({ createdAt: -1 })
    : [];

  res.render("features/email-composer", {
    pageTitle: "Wanpot | Smart Email Composer",
    history,
    user
  });
};

// Generate AI email
export const composeEmail = async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject?.trim() && !body?.trim()) return res.status(400).json({ error: "Please provide subject or body." });

    const prompt = `
      You are a professional email assistant.
      Create a polished, professional email based on the following input:
      Subject: ${subject || "(No Subject)"}
      Body: ${body || "(No Body)"}

      Provide:
      - Well-formatted professional email
      - Improved clarity and tone
      - Suggestions for conciseness and readability
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const aiSuggestion = result.response?.text() || "No AI suggestion generated.";

    // Save to DB if logged in
    if (req.isAuthenticated()) {
      await EmailComposerHistory.create({
        userId: req.user._id,
        subject,
        body,
        aiSuggestion
      });
    }

    res.json({
      success: true,
      aiSuggestion,
      history: req.isAuthenticated()
        ? await EmailComposerHistory.find({ userId: req.user._id }).sort({ createdAt: -1 })
        : []
    });

  } catch (err) {
    console.error("Email Composer Error:", err);
    res.status(500).json({ error: "Failed to generate email." });
  }
};

// Clear history
export const clearEmailHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await EmailComposerHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history." });
  }
};
