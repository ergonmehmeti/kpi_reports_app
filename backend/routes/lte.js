/**
 * LTE Routes
 * Defines API endpoints for LTE daily site traffic operations
 */

import express from 'express';
import { upload, uploadLimiter } from '../utils/fileUpload.js';
import lteController from '../controllers/lteController.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

console.log('✅ LTE routes loaded, controller methods:', Object.keys(lteController));

/**
 * @route   POST /api/lte/upload
 * @desc    Upload and import LTE daily site traffic CSV file
 * @access  Admin only
 */
router.post('/upload', adminOnly, uploadLimiter, upload.single('file'), (req, res, next) => {
  console.log('🔵 LTE upload route hit, file:', req.file?.originalname);
  lteController.uploadCSV(req, res, next);
});

/**
 * @route   GET /api/lte/data
 * @desc    Get LTE traffic data with optional filtering
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @query   siteName - Single site name
 * @query   siteNames - Comma-separated site names
 * @access  Public
 */
router.get('/data', lteController.getData);

/**
 * @route   GET /api/lte/date-range
 * @desc    Get available date range in database
 * @access  Public
 */
router.get('/date-range', lteController.getDateRange);

/**
 * @route   GET /api/lte/sites
 * @desc    Get list of unique site names
 * @access  Public
 */
router.get('/sites', lteController.getSiteList);

/**
 * @route   GET /api/lte/aggregated-stats
 * @desc    Get aggregated statistics by time period
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @query   groupBy - Grouping: 'day', 'week', 'month', 'year'
 * @query   siteName - Optional site filter
 * @access  Public
 */
router.get('/aggregated-stats', lteController.getAggregatedStats);

export default router;
