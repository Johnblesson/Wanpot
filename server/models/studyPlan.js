import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  syllabus: { type: String, required: true },
  goals: { type: String, required: true },
  aiPlan: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("StudyPlan", studyPlanSchema);
