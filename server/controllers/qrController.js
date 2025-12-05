import QRCode from "qrcode";
import sharp from "sharp";
import QrCode from "../models/QrCode.js";
import path from "path";
import fs from "fs";

export const generateQrCode = async (req, res) => {
  try {
    const { text } = req.body;
    const uploadedFile = req.file;

    // 1. Validation (text OR file must be provided)
    if (!text && !uploadedFile) {
      return res.status(400).json({ message: "Provide text or upload a file" });
    }

    let finalData = text;

    // 2. If file uploaded → create a file URL
    let fileUrl = null;

    if (uploadedFile) {
      const filePath = `/uploads/${uploadedFile.filename}`;
      fileUrl = `${req.protocol}://${req.get("host")}${filePath}`;

      // Encode the FILE URL inside the QR
      finalData = fileUrl;
    }

    // 3. Generate QR based on text or file URL
    const qrBuffer = await QRCode.toBuffer(finalData, {
      type: "png",
      width: 600,
      errorCorrectionLevel: "H",
    });

    const base64QR = `data:image/png;base64,${qrBuffer.toString("base64")}`;

    // 4. Save to database
    const qrData = await QrCode.create({
      text: text || null,
      filePath: uploadedFile ? uploadedFile.path : null,
      fileUrl: fileUrl || null,
      qrImage: base64QR,
    });

    return res.json({
      message: "QR Code generated successfully",
      data: qrData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const scanQrCode = async (req, res) => {
      const user = req.isAuthenticated() ? req.user : null;
  // Page for scanning
  return res.render("features/qr-scan", { user: user });
};

export const viewGenerator = async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  return res.render("features/qr-code", { user: user });
};