import CodeRequest from "../models/CodeRequest.js";
import axios from "axios";

export const renderCodeHelper = (req, res) => { 
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/code-helper", 
    { 
      user,
      title: "AI Code Helper" 
    }); 
};



export const runCodeAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt cannot be empty." });
    }

    const modelName = "models/gemini-2.0-flash"; // stable, fast, and supports long responses

    const ai = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract text safely
    const responseText =
      ai?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    // Save to DB
    await CodeRequest.create({
      userId: req.user._id,
      prompt,
      aiResponse: responseText
    });

    return res.json({ response: responseText });

  } catch (err) {
    console.error("GEMINI CODE HELPER ERROR:", err.response?.data || err);
    const message =
      err.response?.data?.error?.message || "Gemini AI assistant failed.";
    return res.status(500).json({ error: message });
  }
};
