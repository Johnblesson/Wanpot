// controllers/aiController.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Render the AI chat page
export const renderAIPage = (req, res) => {
  res.render('ai', { messages: [] });
};

// Generate AI response
export const generateAIResponse = async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body;

    if (!prompt) return res.render('ai', { messages: chatHistory || [] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    // Append new messages
    const messages = chatHistory ? [...chatHistory] : [];
    messages.push({ sender: 'user', text: prompt });
    messages.push({ sender: 'ai', text: response.text });

    res.render('ai', { messages });
  } catch (err) {
    console.error(err);
    const messages = chatHistory ? [...chatHistory] : [];
    messages.push({ sender: 'user', text: req.body.prompt });
    messages.push({ sender: 'ai', text: 'Error generating response. Try again.' });
    res.render('ai', { messages });
  }
};


