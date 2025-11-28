import mongoose from "mongoose";

const budgetHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originalText: { type: String, required: true },
    aiSuggestions: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("BudgetHistory", budgetHistorySchema);
