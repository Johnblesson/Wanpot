import { GoogleGenAI } from "@google/genai";
import ChatHistory from "../models/chatHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render the AI chat page
export const renderAIPage = async (req, res) => {
  try {
    // Optionally, fetch last 1 chat for the user
    const chatRecord = await ChatHistory.findOne({ user: req.user?._id }).sort({ createdAt: -1 }).lean();
    const messages = chatRecord ? chatRecord.messages : [];
    res.render("ai", { messages });
  } catch (err) {
    console.error(err);
    res.render("ai", { messages: [] });
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
      contents: prompt
    });

    // Find or create chat history
    let chatRecord;
    if (chatId) {
      chatRecord = await ChatHistory.findById(chatId);
      if (!chatRecord) {
        chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
      }
    } else {
      chatRecord = new ChatHistory({ user: req.user?._id, messages: [] });
    }

    // Append messages
    chatRecord.messages.push({ sender: "user", text: prompt });
    chatRecord.messages.push({ sender: "ai", text: response.text });

    await chatRecord.save();

    res.render("ai", { messages: chatRecord.messages });
  } catch (err) {
    console.error(err);
    const messages = [{ sender: "user", text: req.body.prompt }, { sender: "ai", text: "Error generating response. Try again." }];
    res.render("ai", { messages });
  }
};
