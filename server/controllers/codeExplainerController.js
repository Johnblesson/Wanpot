import axios from "axios";
import CodeExplainer from "../models/CodeExplainer.js";

// Render Code Explainer page
export const getCodeExplainerPage = (req, res) => {
  res.render("features/codeExplainer", {
    title: "AI Code Explainer",
    user: req.user || null,
  });
};


// Run Code Explainer
export const runCodeExplainer = async (req, res) => {
  try {
    const { codeSnippet } = req.body;

    if (!codeSnippet || codeSnippet.trim() === "") {
      return res.status(400).json({ error: "Code snippet cannot be empty." });
    }

    const modelName = "models/gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // Gemini correct request format
    const ai = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `Explain this code in simple terms:\n\n${codeSnippet}`
              }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract response
    const explanation =
      ai?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No explanation from AI.";

    // Save to DB
    await CodeExplainer.create({
      userId: req.user?._id,
      codeSnippet,
      explanation
    });

    return res.json({ response: explanation });

  } catch (err) {
    console.error("GEMINI CODE EXPLAINER ERROR:", err.response?.data || err);
    const message =
      err.response?.data?.error?.message ||
      "Gemini AI assistant failed.";
    return res.status(500).json({ error: message });
  }
};
