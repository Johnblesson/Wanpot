import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // optional user association
  messages: [messageSchema],
  context: { type: String, default: "sermon-builder" }, // optional tag
  referenceId: { type: mongoose.Schema.Types.ObjectId },   // reference to Sermon
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatHistorySermon", chatHistorySchema);
