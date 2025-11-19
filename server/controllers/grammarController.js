import axios from "axios";

// GET route to render the Grammar page
// export const getGrammarPage = (req, res) => {
//   try {
//     return res.render("features/grammar", { title: "AI Grammar & Proofreading | Wanpot" });
//   } catch (err) {
//     console.error("Error rendering grammar page:", err);
//     return res.status(500).send("Failed to load the page.");
//   }
// };

export const getGrammarPage = (req, res) => { 
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/grammar", 
    { 
      user,
      title: "AI Grammar & Proofreading | Wanpot" 
    }); 
};

// POST route to run grammar & proofreading
export const generateGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text cannot be empty." });
    }

    // Replace with your AI provider endpoint
    const modelName = "models/gemini-2.0-flash"; // Example model
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateText?key=${process.env.GEMINI_API_KEY}`;

    const payload = {
      input: [
        {
          role: "user",
          content: `Correct and enhance the grammar, spelling, and style of the following text:\n\n${text}`
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Extract AI output safely
    const correctedText = response.data?.candidates?.[0]?.content?.[0]?.text || "No corrections generated.";

    return res.json({ correctedText });

  } catch (err) {
    console.error("Grammar Generator Error:", err.response?.data || err);
    const message = err.response?.data?.error?.message || "AI Grammar & Proofreading failed.";
    return res.status(500).json({ error: message });
  }
};
