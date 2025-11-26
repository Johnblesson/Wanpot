import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export const renderPDFTools = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  res.render('features/pdf-tools', { pageTitle: 'Wanpot | PDF Tools', user });
};

export const processPDF = async (req, res) => {
  try {
    const files = req.files;
    const { action, pages } = req.body;

    if (!files || files.length === 0) {
      return res.json({ success: false, error: 'No PDF uploaded' });
    }

    let outputPaths = [];

    switch (action) {
      case 'merge': {
        const outputName = `pdf-tools-${Date.now()}.pdf`;
        const outputPath = path.join(uploadDir, outputName);

        const mergedPdf = await PDFDocument.create();
        for (const file of files) {
          const data = fs.readFileSync(file.path);
          const pdf = await PDFDocument.load(data);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedBytes = await mergedPdf.save();
        fs.writeFileSync(outputPath, mergedBytes);
        outputPaths.push(`/uploads/${outputName}`);
        break;
      }

      case 'split': {
        const outputName = `pdf-tools-${Date.now()}.pdf`;
        const outputPath = path.join(uploadDir, outputName);

        const splitPdf = await PDFDocument.create();
        const pageRanges = pages ? pages.split(',') : ['all'];
        const data = fs.readFileSync(files[0].path);
        const pdf = await PDFDocument.load(data);
        const totalPages = pdf.getPageCount();
        const pagesToAdd = [];

        if (pageRanges[0] === 'all') {
          pagesToAdd.push(...Array.from({ length: totalPages }, (_, i) => i));
        } else {
          pageRanges.forEach(range => {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(Number);
              for (let i = start - 1; i <= end - 1; i++) pagesToAdd.push(i);
            } else {
              pagesToAdd.push(Number(range) - 1);
            }
          });
        }

        const copiedPages = await splitPdf.copyPages(pdf, pagesToAdd);
        copiedPages.forEach(p => splitPdf.addPage(p));
        const splitBytes = await splitPdf.save();
        fs.writeFileSync(outputPath, splitBytes);
        outputPaths.push(`/uploads/${outputName}`);
        break;
      }

      case 'compress': {
        const outputName = `pdf-tools-${Date.now()}.pdf`;
        const outputPath = path.join(uploadDir, outputName);

        const pdf = await PDFDocument.load(fs.readFileSync(files[0].path));
        const compressedBytes = await pdf.save({ useObjectStreams: false, addDefaultEncoding: true });
        fs.writeFileSync(outputPath, compressedBytes);
        outputPaths.push(`/uploads/${outputName}`);
        break;
      }

      default:
        return res.json({ success: false, error: 'Invalid action' });
    }

    // Cleanup uploaded PDFs
    files.forEach(f => fs.unlinkSync(f.path));

    res.json({ success: true, urls: outputPaths });

  } catch (err) {
    console.error(err);
    res.json({ success: false, error: 'Error processing PDF' });
  }
};
