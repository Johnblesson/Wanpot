import fs from "fs";
import path from "path";
import sharp from "sharp";
import nodePandoc from "node-pandoc";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export const renderFileConverter = (req, res) => {
  res.render("features/file-converter", { pageTitle: "Wanpot | File Converter" });
};

export const convertFile = async (req, res) => {
  try {
    const file = req.file;
    const { targetFormat } = req.body;

    if (!file) return res.json({ success: false, error: "No file uploaded" });

    const inputPath = file.path;
    const outputPath = path.join(uploadDir, `${Date.now()}.${targetFormat}`);
    const ext = path.extname(file.originalname).toLowerCase();

    const imageFormats = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
    const docFormats = [".txt", ".md", ".docx", ".rtf", ".pdf"];

    if (imageFormats.includes(ext)) {
      // Convert image with Sharp
      await sharp(inputPath).toFormat(targetFormat).toFile(outputPath);
    } else if (docFormats.includes(ext)) {
      // Convert document with Pandoc
      await new Promise((resolve, reject) => {
        nodePandoc(inputPath, `-o ${outputPath}`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } else {
      return res.json({ success: false, error: "Unsupported file format." });
    }

    fs.unlinkSync(inputPath);
    res.json({ success: true, url: `/uploads/${path.basename(outputPath)}` });
  } catch (err) {
    console.error("Conversion error:", err);
    res.json({ success: false, error: "Conversion failed. Please try again." });
  }
};
