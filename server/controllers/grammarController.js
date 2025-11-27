import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GRAMMAR_PROMPT = (text) => `
Correct and enhance the following text for grammar, spelling, punctuation, style, clarity, and readability. 
Maintain the original meaning and make it professional, smooth, and polished.

Text:
"""${text}"""
`;

export const getGrammarPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/grammar", { user });
  } catch (err) {
    console.error(err);
    res.render("features/grammar", { user:null });
  }
};

export const runGrammarAI = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error:"Text is required." });

    let aiResult = null;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    for(let attempt=0; attempt<MAX_RETRIES; attempt++){
      try {
        aiResult = await ai.models.generateContent({
          model:"gemini-2.5-flash",
          contents: GRAMMAR_PROMPT(text)
        });
        break;
      } catch(err){
        const status = err?.status || err?.response?.status;
        if ((status===503 || status===429) && attempt<MAX_RETRIES-1) {
          await new Promise(r=>setTimeout(r, RETRY_DELAY*(attempt+1)));
          continue;
        } else throw err;
      }
    }

    let corrected = "No correction generated.";
    if(aiResult?.text) corrected = aiResult.text;
    else if(aiResult?.candidates?.[0]?.content?.[0]?.text) corrected = aiResult.candidates[0].content[0].text;
    else if(aiResult?.output?.[0]?.content?.[0]?.text) corrected = aiResult.output[0].content[0].text;
    else if(typeof aiResult==="string") corrected = aiResult;

    return res.json({ corrected });
  } catch(err){
    console.error("Grammar AI error:", err);
    return res.status(500).json({ error: err.message || "AI service failed." });
  }
};
