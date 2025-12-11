/**
 * LTE KPI Routes
 * Defines API endpoints for LTE KPI data operations
 */

import express from 'express';
import { upload, uploadLimiter } from '../utils/fileUpload.js';
import lteKpiController from '../controllers/lteKpiController.js';

const router = express.Router();

/**
 * @route   POST /api/lte-kpi/upload
 * @desc    Upload and import LTE KPI data CSV file
 * @access  Public (with rate limiting)
 */
router.post('/upload', uploadLimiter, upload.single('file'), lteKpiController.uploadKpiData);

/**
 * @route   GET /api/lte-kpi/data
 * @desc    Get LTE KPI data for date range
 * @access  Public
 */
router.get('/data', lteKpiController.getKpiData);

export default router;
