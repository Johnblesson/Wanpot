import { GoogleGenAI } from "@google/genai";
import MentalHealthHistory from "../models/MentalHealthHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const renderMentalHealthBuddy = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : { id: "guest", name: "Guest" };
  const history = await MentalHealthHistory.find({ userId: user.id }).sort({ createdAt: -1 });
  res.render("features/mentalHealthBuddy", { pageTitle: "Wanpot | Mental Health Buddy", user, history });
};

export const handleMentalHealthPrompt = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : { id: "guest" };
    const { prompt } = req.body;

    // Gemini AI response
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a supportive mental health AI assistant. Respond kindly and provide stress-relief or motivational guidance to the following user input: "${prompt}".`
    });

    const responseText = result.response?.text?.() || "Sorry, AI could not generate a response.";

    // store in database
    const entry = new MentalHealthHistory({
      userId: user.id,
      prompt,
      response: responseText
    });
    await entry.save();

    // return response
    const history = await MentalHealthHistory.find({ userId: user.id }).sort({ createdAt: -1 });
    res.json({ response: responseText, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
};
