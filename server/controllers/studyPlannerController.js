import { GoogleGenAI } from "@google/genai";
import Model from "../models/studyPlan.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateStudyPlan = async (req, res) => {
  try {
    const { subject, syllabus, goals } = req.body;

    const prompt = `
      Generate a personalized study plan:
      Subject: ${subject}
      Syllabus: ${syllabus}
      Goals: ${goals}
      Provide a structured weekly plan, recommended resources, and study habits.
      Format the response in clean markdown.
    `;

    // ---- GEMINI RESPONSE ----
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const aiPlan = result.response.candidates[0].content.parts[0].text;

    // ---- SAVE TO DB ----
    const newEntry = await Model.create({
      subject,
      syllabus,
      goals,
      aiPlan
    });

    const history = await Model.find().sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export const clearStudyHistory = async (req, res) => {
  await Model.deleteMany({});
  res.json({ success: true });
};



export const renderStudyPlanner = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;

    // Fetch DB history
    const history = await Model.find().sort({ createdAt: -1 });

    res.render("features/studyPlanner", {
      title: "AI Study Planner",
      user,
      history    // ✅ <<< FIXED: Pass history to EJS
    });
  } catch (err) {
    res.status(500).send("Error loading Study Planner page: " + err.message);
  }
};

