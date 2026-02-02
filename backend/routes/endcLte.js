import express from 'express';
import endcLteController from '../controllers/endcLteController.js';
import { upload } from '../utils/fileUpload.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/endc-lte/upload
 * @desc    Upload and import EN-DC LTE traffic data CSV (pm_DC_E_ERBS_EUTRANCELLFDD_FLEX_HOUR)
 * @access  Admin only
 */
router.post('/upload', adminOnly, upload.single('file'), endcLteController.uploadRawData);

/**
 * @route   GET /api/endc-lte/traffic
 * @desc    Get EN-DC LTE traffic data (hourly) for date range
 * @access  Public
 */
router.get('/traffic', endcLteController.getTrafficData);

/**
 * @route   GET /api/endc-lte/traffic-by-date
 * @desc    Get EN-DC LTE traffic data aggregated by date (daily totals)
 * @access  Public
 */
router.get('/traffic-by-date', endcLteController.getTrafficDataByDate);

/**
 * @route   DELETE /api/endc-lte/traffic
 * @desc    Delete EN-DC LTE traffic data for date range
 * @access  Admin only
 */
router.delete('/traffic', adminOnly, endcLteController.deleteTrafficData);

export default router;
