import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for file uploads - prevents abuse
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many upload requests from this IP, please try again later.'
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Upload and parse CSV/Excel file
router.post('/upload', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file using SheetJS
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Optional: Delete file after processing
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'File processed successfully',
      filename: req.file.originalname,
      rowCount: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file', details: error.message });
  }
});

// Get sample data structure
router.get('/sample', (req, res) => {
  res.json({
    message: 'Upload CSV/Excel file to /api/csv/upload',
    requiredFormat: {
      headers: ['Column1', 'Column2', 'Column3'],
      example: [
        { Column1: 'Value1', Column2: 'Value2', Column3: 'Value3' }
      ]
    }
  });
});

export default router;
