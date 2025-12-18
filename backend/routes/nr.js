import express from 'express';
import nrKpiController from '../controllers/nrKpiController.js';
import { upload } from '../utils/fileUpload.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/nr/upload
 * @desc    Upload and import NR raw data CSV/XLSX
 * @access  Private
 */
router.post('/upload', verifyToken, upload.single('file'), nrKpiController.uploadRawData);

/**
 * @route   GET /api/nr/data
 * @desc    Get NR KPI data for date range
 * @access  Private
 */
router.get('/data', verifyToken, nrKpiController.getKpiData);

/**
 * @route   GET /api/nr/kpi
 * @desc    Get NR KPI data for date range (alias)
 * @access  Private
 */
router.get('/kpi', verifyToken, nrKpiController.getKpiData);

/**
 * @route   DELETE /api/nr/kpi
 * @desc    Delete NR KPI data for date range
 * @access  Private (Admin only ideally)
 */
router.delete('/kpi', verifyToken, nrKpiController.deleteKpiData);

export default router;
