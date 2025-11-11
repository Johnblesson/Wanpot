import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', TaskSchema);
