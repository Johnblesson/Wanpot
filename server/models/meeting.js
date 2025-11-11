import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Meeting', meetingSchema);
