import { GoogleGenAI } from "@google/genai";
import BudgetHistory from "../models/BudgetHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// RENDER PAGE
export const renderBudgetOptimizer = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const history = user
    ? await BudgetHistory.find({ userId: user._id }).sort({ createdAt: -1 })
    : [];

  res.render("features/budgetOptimizer", {
    pageTitle: "Wanpot | AI Budget Optimizer",
    history,
    user,
  });
};

// PROCESS BUDGET INPUT
export const analyzeBudget = async (req, res) => {
  try {
    const { budgetText } = req.body;
    if (!budgetText || !budgetText.trim()) {
      return res.status(400).json({ error: "Budget details are required." });
    }

    const prompt = `
      You are a financial planner AI.

      Analyze the following budget/expense data and provide:
      - Suggestions to save money
      - Smarter expense allocations
      - Tips for long-term financial health

      Budget data:
      ${budgetText}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const analysis = result.response.text();

    let historyRecord = null;
    if (req.isAuthenticated()) {
      historyRecord = await BudgetHistory.create({
        userId: req.user._id,
        originalText: budgetText,
        aiSuggestions: analysis,
      });
    }

    res.json({
      success: true,
      analysis,
      history: req.isAuthenticated()
        ? await BudgetHistory.find({ userId: req.user._id }).sort({ createdAt: -1 })
        : [],
    });
  } catch (err) {
    console.error("Budget Optimizer Error:", err);
    res.status(500).json({ error: "Failed to analyze budget." });
  }
};

// CLEAR HISTORY
export const clearBudgetHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await BudgetHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history." });
  }
};
