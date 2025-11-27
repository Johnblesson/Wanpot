import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const renderStoryPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/aiStoryWriter", { user });
  } catch (err) {
    console.error(err);
    res.render("features/aiStoryWriter", { user: null });
  }
};

export const generateStory = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    // AI call
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a creative, engaging story based on this idea: ${prompt}`
    });

    const story = response?.output?.[0]?.content?.[0]?.text || "No story generated.";

    res.json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate story." });
  }
};
