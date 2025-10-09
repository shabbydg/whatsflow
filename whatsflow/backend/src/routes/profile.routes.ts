import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  scrapeProfile,
  getScrapingStatus,
  getScrapingProgress,
  uploadKnowledgeFile,
  addManualKnowledge,
  getKnowledgeBase,
  getProfile,
  updateProfile,
  updateKnowledgeBase
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/knowledge/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.docx', '.doc', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOCX, and MD files are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Profile CRUD
router.get('/', getProfile);
router.put('/', updateProfile);

// Scrape business profile from website
router.post('/scrape', scrapeProfile);

// Get scraping status (database)
router.get('/scraping/status', getScrapingStatus);

// Get real-time scraping progress
router.get('/scraping/progress', getScrapingProgress);

// Knowledge base management
router.get('/knowledge', getKnowledgeBase);
router.put('/knowledge', updateKnowledgeBase);
router.post('/knowledge/upload', upload.single('file'), uploadKnowledgeFile);
router.post('/knowledge/manual', addManualKnowledge);

export default router;
