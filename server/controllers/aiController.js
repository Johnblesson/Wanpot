// controllers/aiController.js
import { GoogleGenAI } from "@google/genai";
import ChatHistory from "../models/chatHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render the AI chat page
export const renderAIPage = async (req, res) => {
  try {
    // Fetch the latest chat for this user
    const chatRecord = await ChatHistory.findOne({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .lean();

    const messages = chatRecord ? chatRecord.messages : [];
    const chatId = chatRecord ? chatRecord._id : null;

    res.render("ai", { messages, chatId });
  } catch (err) {
    console.error(err);
    res.render("ai", { messages: [], chatId: null });
  }
};

// Generate AI response
export const generateAIResponse = async (req, res) => {
  try {
    const { prompt, chatId } = req.body;

    if (!prompt) return res.redirect("/ai");

    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Find existing chat or create a new one
    let chatRecord;
    if (chatId) {
      chatRecord = await ChatHistory.findById(chatId);
    }

    if (!chatRecord) {
      chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    }

    // Append user and AI messages
    chatRecord.messages.push({ sender: "user", text: prompt });
    chatRecord.messages.push({ sender: "ai", text: response.text });

    await chatRecord.save();

    // Render updated chat with persistent chatId
    res.render("ai", { messages: chatRecord.messages, chatId: chatRecord._id });
  } catch (err) {
    console.error(err);
    const messages = [
      { sender: "user", text: req.body.prompt },
      { sender: "ai", text: "Error generating response. Try again." },
    ];
    res.render("ai", { messages, chatId: null });
  }
};
