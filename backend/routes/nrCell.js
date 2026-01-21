import express from 'express';
import nrCellKpiController from '../controllers/nrCellKpiController.js';
import { upload } from '../utils/fileUpload.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/nr-cell/upload
 * @desc    Upload and import NR Cell raw data CSV (pm_DC_E_NR_NRCELLDU_HOUR)
 * @access  Admin only
 */
router.post('/upload', adminOnly, upload.single('file'), nrCellKpiController.uploadRawData);

/**
 * @route   GET /api/nr-cell/kpi-hourly
 * @desc    Get NR Cell KPI hourly data for date range
 * @access  Public
 */
router.get('/kpi-hourly', nrCellKpiController.getHourlyKpiData);

/**
 * @route   GET /api/nr-cell/traffic-weekly
 * @desc    Get NR Cell weekly traffic data for date range
 * @access  Public
 */
router.get('/traffic-weekly', nrCellKpiController.getWeeklyTrafficData);

/**
 * @route   DELETE /api/nr-cell/kpi-hourly
 * @desc    Delete NR Cell KPI hourly data for date range
 * @access  Admin only
 */
router.delete('/kpi-hourly', adminOnly, nrCellKpiController.deleteHourlyKpiData);

/**
 * @route   DELETE /api/nr-cell/traffic-weekly
 * @desc    Delete NR Cell weekly traffic data for date range
 * @access  Admin only
 */
router.delete('/traffic-weekly', adminOnly, nrCellKpiController.deleteWeeklyTrafficData);

export default router;
