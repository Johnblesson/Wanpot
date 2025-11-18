import mongoose from "mongoose";

const CodeExplainerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  codeSnippet: { type: String, required: true },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CodeExplainer", CodeExplainerSchema);
