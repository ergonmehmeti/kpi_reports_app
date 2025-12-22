import express from 'express';
import nrKpiController from '../controllers/nrKpiController.js';
import { upload } from '../utils/fileUpload.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/nr/upload
 * @desc    Upload and import NR raw data CSV/XLSX
 * @access  Admin only
 */
router.post('/upload', adminOnly, upload.single('file'), nrKpiController.uploadRawData);

/**
 * @route   GET /api/nr/data
 * @desc    Get NR KPI data for date range
 * @access  Public
 */
router.get('/data', nrKpiController.getKpiData);

/**
 * @route   GET /api/nr/kpi
 * @desc    Get NR KPI data for date range (alias)
 * @access  Public
 */
router.get('/kpi', nrKpiController.getKpiData);

/**
 * @route   DELETE /api/nr/kpi
 * @desc    Delete NR KPI data for date range
 * @access  Admin only
 */
router.delete('/kpi', adminOnly, nrKpiController.deleteKpiData);

export default router;
