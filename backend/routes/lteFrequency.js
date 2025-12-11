/**
 * LTE Frequency Routes
 * Defines API endpoints for LTE frequency data operations
 */

import express from 'express';
import { upload, uploadLimiter } from '../utils/fileUpload.js';
import lteFrequencyController from '../controllers/lteFrequencyController.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/lte-frequency/upload
 * @desc    Upload and import LTE frequency data CSV file
 * @access  Admin only (with authentication)
 */
router.post('/upload', adminOnly, uploadLimiter, upload.single('file'), lteFrequencyController.uploadCSV);

/**
 * @route   GET /api/lte-frequency/data
 * @desc    Get LTE frequency data with optional filtering
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @query   earfcndl - Frequency channel number
 * @access  Public
 */
router.get('/data', lteFrequencyController.getData);

/**
 * @route   GET /api/lte-frequency/date-range
 * @desc    Get available date range in database
 * @access  Public
 */
router.get('/date-range', lteFrequencyController.getDateRange);

/**
 * @route   GET /api/lte-frequency/frequencies
 * @desc    Get list of unique frequency channels
 * @access  Public
 */
router.get('/frequencies', lteFrequencyController.getFrequencyList);

/**
 * @route   GET /api/lte-frequency/aggregated-stats
 * @desc    Get aggregated statistics by time period
 * @query   startDate - Start date (YYYY-MM-DD)
 * @query   endDate - End date (YYYY-MM-DD)
 * @query   groupBy - Grouping: 'day', 'week', 'month', 'year'
 * @query   earfcndl - Optional frequency filter
 * @access  Public
 */
router.get('/aggregated-stats', lteFrequencyController.getAggregatedStats);

export default router;
