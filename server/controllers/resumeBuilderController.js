import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const renderResumeBuilder = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const templates = ["classic", "modern", "minimal"];
  const colors = ["#3b82f6", "#06b6d4", "#ef4444", "#f59e0b"];

  res.render("features/resume", {
    templates,
    colors,
    pageTitle: "Wanpot | Resume Builder",
    user,
  });
};

export const enhanceResume = async (req, res) => {
  try {
    const { name, email, phone, summary, education, experience, skills } = req.body;

    const prompt = `
      You are a professional HR and Resume Optimization Expert.
      Rewrite and enhance this resume concisely, professionally, and clearly.

      Name: ${name}
      Email: ${email}
      Phone: ${phone}

      Summary: ${summary}
      Education: ${education?.join(", ")}

      Experience: ${experience?.join(", ")}

      Skills: ${skills}
    `;

    // Gemini v2 correct model call
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Correct response extraction
    const enhancedText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No improved resume generated.";

    res.json({ enhanced: enhancedText });

  } catch (err) {
    console.error("Resume Enhancement Error:", err);
    res.status(500).json({ error: "Failed to enhance resume." });
  }
};
