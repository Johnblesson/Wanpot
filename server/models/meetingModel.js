// models/meetingModel.js
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transcript: { type: String, required: true },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Meeting = mongoose.model("MeetingSummarizer", meetingSchema);
export default Meeting;
