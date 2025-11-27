import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render Research Assistant page
export const renderResearchPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/research-assistant", { user }); // render the front-end page
  } catch (err) {
    console.error(err);
    res.render("features/research-assistant", { user: null });
  }
};

// Generate research summary
export const generateSummary = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // Optional: you can prepend a prompt to guide the AI
    const prompt = `Summarize the following research article or paper concisely, highlighting key points, main arguments, and insights:\n\n${text}`;

    let aiResponse;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    // Retry in case of model overload
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        break; // success
      } catch (error) {
        if (error.status === 503 && attempt < MAX_RETRIES - 1) {
          console.warn(`Model overloaded. Retrying in ${RETRY_DELAY * (attempt + 1)}ms...`);
          await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)));
        } else {
          throw error;
        }
      }
    }

    // Extract generated summary
    const summary = aiResponse?.candidates?.[0]?.content?.[0]?.text?.trim() || "No summary generated.";

    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};
