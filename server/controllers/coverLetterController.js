// coverLetterController.js
import axios from "axios";

export const generateCoverLetter = async (req, res) => {
  try {
    const { jobDesc } = req.body;
    if (!jobDesc || jobDesc.trim() === "") {
      return res.status(400).json({ error: "Job description cannot be empty." });
    }

    const modelName = "models/gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Create a professional, tailored cover letter for this job description:\n\n${jobDesc}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        candidateCount: 1,
        maxOutputTokens: 500
      }
    };

    const aiResponse = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" }
    });

    // Try different paths to get the generated text
    let coverLetter = 
      aiResponse.data?.candidates?.[0]?.content?.[0]?.text || 
      aiResponse.data?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text ||
      aiResponse.data?.output?.[0]?.content?.[0]?.text ||
      "No cover letter generated.";

    return res.json({ coverLetter });

  } catch (err) {
    console.error("Cover Letter Generator Error:", err.response?.data || err);
    const message = err.response?.data?.error?.message || "AI Cover Letter Generator failed.";
    return res.status(500).json({ error: message });
  }
};





export const renderCoverLetter = (req, res) => { 
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/cover-letter", 
    { 
      user,
      title: "AI Cover Letter Generator" 
    }); 
};

