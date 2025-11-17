import CodeRequest from "../models/CodeRequest.js";
import axios from "axios";

export const renderCodeHelper = (req, res) => {
  res.render("features/code-helper", {
    user: req.user,
    title: "AI Code Helper"
  });
};

export const runCodeAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt cannot be empty." });
    }

    const modelName = "models/gemini-2.5"; // make sure this model exists for your API key

    const ai = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateText?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt: { text: prompt }
        // Do NOT add temperature or max_output_tokens here
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const responseText = ai?.data?.candidates?.[0]?.content || "No response from Gemini.";

    // Save to DB
    const saved = new CodeRequest({
      userId: req.user._id,
      prompt,
      aiResponse: responseText
    });
    await saved.save();

    return res.json({ response: responseText });
  } catch (err) {
    console.error("GEMINI CODE HELPER ERROR:", err.response?.data || err);
    const message = err.response?.data?.error?.message || "Gemini AI assistant failed.";
    return res.status(500).json({ error: message });
  }
};
