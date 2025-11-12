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

// Generate AI response
export const generateAIResponse = async (req, res) => {
  try {
    const { prompt, chatId } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let chatRecord;
    if (chatId) {
      chatRecord = await ChatHistory.findById(chatId);
      if (!chatRecord) chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    } else {
      chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    }

    chatRecord.messages.push({ sender: "user", text: prompt });
    chatRecord.messages.push({ sender: "ai", text: aiResponse.text });
    await chatRecord.save();

    res.json({ chatId: chatRecord._id, messages: chatRecord.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ messages: [{ sender: "ai", text: "Error generating response. Try again." }] });
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
