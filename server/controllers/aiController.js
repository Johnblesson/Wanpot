import { GoogleGenAI } from "@google/genai";
import ChatHistory from "../models/chatHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render AI page with existing messages
export const renderAIPage = async (req, res) => {
  try {
    const chatRecord = await ChatHistory.findOne({ user: req.user?._id }).sort({ createdAt: -1 }).lean();
    const messages = chatRecord ? chatRecord.messages : [];
    const chatId = chatRecord ? chatRecord._id : null;

    const user = req.isAuthenticated() ? req.user : null;
    
    res.render("ai", { messages, chatId, user });
  } catch (err) {
    console.error(err);
    res.render("ai", { messages: [], chatId: null });
  }
};

// // Generate AI response
// export const generateAIResponse = async (req, res) => {
//   try {
//     const { prompt, chatId } = req.body;
//     if (!prompt) return res.status(400).json({ error: "Prompt is required" });

//     const aiResponse = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt
//     });

//     let chatRecord;
//     if (chatId) {
//       chatRecord = await ChatHistory.findById(chatId);
//       if (!chatRecord) chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
//     } else {
//       chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
//     }

//     chatRecord.messages.push({ sender: "user", text: prompt });
//     chatRecord.messages.push({ sender: "ai", text: aiResponse.text });
//     await chatRecord.save();

//     res.json({ chatId: chatRecord._id, messages: chatRecord.messages });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ messages: [{ sender: "ai", text: "Error generating response. Try again." }] });
//   }
// };

// Generate AI response with retry on overload
export const generateAIResponse = async (req, res) => {
  try {
    const { prompt, chatId } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const MAX_RETRIES = 3;          // Number of retry attempts
    const RETRY_DELAY = 1000;       // Initial delay in ms
    let aiResponse;

    // Retry loop for overloaded model
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        break; // Success, exit loop
      } catch (error) {
        if (error.status === 503) { // Model overloaded
          if (attempt < MAX_RETRIES - 1) {
            console.warn(`Model overloaded. Retrying in ${RETRY_DELAY * (attempt + 1)}ms...`);
            await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)));
          } else {
            throw new Error("AI service is currently busy. Please try again later.");
          }
        } else {
          throw error; // Other errors
        }
      }
    }

    // Load or create chat record
    let chatRecord;
    if (chatId) {
      chatRecord = await ChatHistory.findById(chatId);
      if (!chatRecord) chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    } else {
      chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    }

    // Save user message
    chatRecord.messages.push({ sender: "user", text: prompt });
    // Save AI message
    chatRecord.messages.push({ sender: "ai", text: aiResponse.text || "AI did not return a response." });

    await chatRecord.save();

    res.json({ chatId: chatRecord._id, messages: chatRecord.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      messages: [{ sender: "ai", text: err.message || "Error generating response. Try again later." }]
    });
  }
};


// Delete single message
export const deleteChatMessage = async (req, res) => {
  try {
    const { chatId, index } = req.body;
    if (!chatId || index === undefined) return res.status(400).json({ error: "chatId and index required" });

    const chat = await ChatHistory.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.messages.splice(index, 1);
    await chat.save();
    res.json({ messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Clear all chat
export const clearAllChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ error: "chatId required" });

    const chat = await ChatHistory.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.messages = [];
    await chat.save();
    res.json({ messages: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear chat" });
  }
};



export const renderResumeBuilder = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const templates = ["classic", "modern", "minimal"];
  const colors = ["#3b82f6", "#06b6d4", "#ef4444", "#f59e0b"];
  res.render("features/resume", { templates, colors, pageTitle: "Wanpot | Resume Builder", user });
};

export const enhanceResume = async (req, res) => {
  try {
    const { name, email, phone, summary, education, experience, skills } = req.body;
    const prompt = `
      Improve this resume professionally and concisely.
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Summary: ${summary}
      Education: ${education.join(", ")}
      Experience: ${experience.join(", ")}
      Skills: ${skills}
    `;
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const enhancedText = result.response.text();
    res.json({ enhanced: enhancedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to enhance resume." });
  }
};