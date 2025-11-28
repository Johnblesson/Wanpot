import { GoogleGenAI } from "@google/genai";
import CoverLetter from "../models/CoverLetter.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const COVER_LETTER_PROMPT_TEMPLATE = (jobDescription) => `
Generate a professional, polished cover letter for the following job description:

${jobDescription}

Make it concise, persuasive, and tailored for the role. Ensure clarity, strong professional tone, and relevance. Suggest improvements if needed.
`;

// Render Cover Letter Page
export const renderCoverLetterPage = (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/coverLetter", {
      user,
      coverLetter: null,
      jobDescription: "",
      error: null
    });
  } catch (err) {
    console.error("Render Cover Letter Page Error:", err);
    res.render("features/coverLetter", {
      user: null,
      coverLetter: null,
      jobDescription: "",
      error: "Failed to load page."
    });
  }
};

// Generate AI Cover Letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription?.trim())
      return res.status(400).json({ error: "Job description is required." });

    const userId = req.user?._id || null;
    const promptText = COVER_LETTER_PROMPT_TEMPLATE(jobDescription.trim());

    // Save initial request
    const coverRecord = await CoverLetter.create({
      userId,
      jobDescription: jobDescription.trim(),
      promptSent: promptText,
      generated: ""
    });

    // Retry logic for transient API errors
    const MAX_RETRIES = 3;
    let aiResult = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        aiResult = await ai.models.generateContent({
          model: "gemini-2.5-flash", // correct model name
          contents: promptText
        });
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if ((status === 503 || status === 429) && attempt < MAX_RETRIES - 1) {
          console.warn(`Retrying AI request, attempt ${attempt + 1}`);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        } else throw err;
      }
    }

    // Extract AI output
    let generatedText = "No cover letter generated.";
    if (aiResult?.text) generatedText = aiResult.text;
    else if (aiResult?.candidates?.[0]?.content?.[0]?.text)
      generatedText = aiResult.candidates[0].content[0].text;
    else if (typeof aiResult === "string") generatedText = aiResult;

    // Save generated output
    coverRecord.generated = generatedText;
    await coverRecord.save();

    return res.json({ coverLetter: generatedText });

  } catch (err) {
    console.error("Cover Letter Generator Error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to generate cover letter." });
  }
};
