// controllers/resumeAnalyzerController.js
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import fs from "fs";
import ResumeHistory from "../models/ResumeAnalysisHistory.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// RENDER PAGE
export const renderResumeAnalyzer = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;

  const history = user
    ? await ResumeHistory.find({ userId: user._id }).sort({ createdAt: -1 })
    : [];

  res.render("features/resumeAnalyzer", {
    pageTitle: "Wanpot | AI Resume Analyzer",
    history,
    user
  });
};

// PROCESS RESUME
export const analyzeResume = async (req, res) => {
  try {
    let resumeText = req.body.resumeText || "";

    // If DOCX file uploaded
    if (req.file) {
      const filePath = req.file.path;

      if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const data = await mammoth.extractRawText({ path: filePath });
        resumeText = data.value || "";
      }

      fs.unlinkSync(filePath);
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Resume content is empty." });
    }

    const prompt = `
      You are an expert Resume Reviewer & ATS Optimization Specialist.

      Analyze the following resume and provide:
      - Formatting improvements
      - Clarity & grammar fixes
      - Professional tone enhancements
      - Missing sections (if any)
      - ATS keyword optimization
      - Strengths and weaknesses

      Resume content:
      ${resumeText}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    // 🔥 FIXED: Extract text from Gemini 2.0 output safely
    const analysis =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI did not return a valid response.";

    // Save to DB
    if (req.isAuthenticated()) {
      await ResumeHistory.create({
        userId: req.user._id,
        originalText: resumeText,
        aiSuggestions: analysis
      });
    }

    res.json({
      success: true,
      analysis,
      history: req.isAuthenticated()
        ? await ResumeHistory.find({ userId: req.user._id }).sort({ createdAt: -1 })
        : []
    });

  } catch (err) {
    console.error("Resume Analyzer Error:", err);
    res.status(500).json({ error: "Failed to analyze resume." });
  }
};

// CLEAR HISTORY
export const clearResumeHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await ResumeHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history." });
  }
};
