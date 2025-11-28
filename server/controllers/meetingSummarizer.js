// controllers/meetingController.js
import { GoogleGenAI } from "@google/genai";
import Meeting from "../models/meetingModel.js";

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const renderMeetingPage = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : { id: "guest", name: "Guest" };
  res.render("features/meetingSummarizer", { 
    user, 
    summary: null, 
    transcript: "", 
    error: null  // <-- add this
  });
};


export const generateSummary = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || transcript.trim().length === 0) {
      return res.render("meetingSummarizer", { summary: null, transcript, error: "Transcript cannot be empty." });
    }

    // Call Google GenAI for summarization
    const response = await ai.responses.generate({
      model: "gpt-4.1-mini",
      input: `Summarize this meeting transcript into concise bullet points:\n\n${transcript}`
    });

    const summary = response.output[0].content[0].text;

    // Save to DB
    await Meeting.create({
      user: req.user._id,
      transcript,
      summary,
    });

    res.render("meetingSummarizer", { summary, transcript, error: null });

  } catch (err) {
    console.error(err);
    res.render("meetingSummarizer", { summary: null, transcript: req.body.transcript, error: "Failed to generate summary. Try again." });
  }
};
