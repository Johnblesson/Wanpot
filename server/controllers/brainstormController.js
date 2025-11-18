// controllers/brainstormController.js
import BrainstormRequest from '../models/Brainstorm.js';
import axios from 'axios'; // or your AI service client

// Render Brainstorm page
export const getBrainstormPage = (req, res) => {
  res.render('features/brainstorm', {
    title: 'AI Brainstorming Tool',
    user: req.user || null,
  });
};


// export const runBrainstorm = async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     if (!prompt || prompt.trim() === "") {
//       return res.status(400).json({ error: "Prompt cannot be empty." });
//     }

//     const modelName = "models/gemini-2.0-flash";
//     const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

//     const ai = await axios.post(
//       url,
//       {
//         contents: [{ text: prompt }]
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     console.log("Raw Gemini response:", JSON.stringify(ai.data, null, 2));

//     let responseText = "No response from Gemini.";

//     if (ai?.data) {
//       if (ai.data.candidates?.[0]?.content?.[0]?.text) {
//         responseText = ai.data.candidates[0].content[0].text;
//       } else if (ai.data.output?.[0]?.content?.[0]?.text) {
//         responseText = ai.data.output[0].content[0].text;
//       }
//     }

//     await CodeRequest.create({
//       userId: req.user._id,
//       prompt,
//       aiResponse: responseText
//     });

//     return res.json({ response: responseText });

//   } catch (err) {
//     console.error("GEMINI CODE HELPER ERROR:", err.response?.data || err);
//     const message = err.response?.data?.error?.message || "Gemini AI assistant failed.";
//     return res.status(500).json({ error: message });
//   }
// };



export const runBrainstorm = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt cannot be empty." });
    }

    const modelName = "models/gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const ai = await axios.post(
      url,
      {
        requests: [
          {
            prompt: { text: prompt },
            temperature: 0.7,
            candidate_count: 1,
            max_output_tokens: 200
          }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Raw Gemini response:", JSON.stringify(ai.data, null, 2));

    let responseText = ai?.data?.responses?.[0]?.candidates?.[0]?.content?.[0]?.text || 
                       "No response from Gemini.";

    // Save to DB (if you want)
    await BrainstormRequest.create({
      userId: req.user._id,
      prompt,
      aiResponse: responseText
    });

    return res.json({ response: responseText });

  } catch (err) {
    console.error("GEMINI CODE HELPER ERROR:", err.response?.data || err);
    const message = err.response?.data?.error?.message || "Gemini AI assistant failed.";
    return res.status(500).json({ error: message });
  }
};
