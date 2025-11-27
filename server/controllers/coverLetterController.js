import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render Cover Letter page
export const renderCoverLetterPage = (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/coverLetter", { user });
  } catch (err) {
    console.error(err);
    res.render("features/ coverLetter", { user: null });
  }
};

// Generate AI cover letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: "Job description is required." });

    const prompt = `
      Generate a professional, polished cover letter based on the following job description:
      ${jobDescription}

      Ensure it is concise, persuasive, and tailored for the role.
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const coverLetter = aiResponse?.candidates?.[0]?.content?.[0]?.text || "No output generated.";
    res.json({ coverLetter });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate cover letter." });
  }
};
