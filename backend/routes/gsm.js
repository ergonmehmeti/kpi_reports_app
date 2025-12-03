/**
 * GSM KPI Routes
 * Defines API endpoints for GSM KPI operations
 */

import express from 'express';
import { upload, uploadLimiter } from '../utils/fileUpload.js';
import gsmController from '../controllers/gsmController.js';

const router = express.Router();

/**
 * @route   POST /api/gsm/upload
 * @desc    Upload and import GSM KPI CSV file
 * @access  Public (with rate limiting)
 */
router.post('/upload', uploadLimiter, upload.single('file'), gsmController.uploadCSV);

/**
 * @route   GET /api/gsm/data
 * @desc    Get GSM KPI data with optional date filtering
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @access  Public
 */
router.get('/data', gsmController.getData);

/**
 * @route   GET /api/gsm/date-range
 * @desc    Get available date range in database
 * @access  Public
 */
router.get('/date-range', gsmController.getDateRange);

/**
 * @route   GET /api/gsm/daily-stats
 * @desc    Get daily aggregated statistics
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @access  Public
 */
router.get('/daily-stats', gsmController.getDailyStats);

export default router;
