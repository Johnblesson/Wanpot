import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  imagePath: { type: String },     // stored uploaded image
  qrImage: { type: String },        // final QR image (base64)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("QrCode", qrCodeSchema);
