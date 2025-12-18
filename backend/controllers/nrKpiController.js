import XLSX from 'xlsx';
import * as nrKpiService from '../services/nrKpiService.js';
import { deleteFile } from '../utils/fileUpload.js';

/**
 * Parse date from CSV (format: MM/DD/YYYY or M/D/YYYY)
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Handle Excel serial number
  if (typeof dateStr === 'number' || !isNaN(Number(dateStr))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Number(dateStr);
    const jsDate = new Date(excelEpoch.getTime() + days * 86400000);
    return jsDate.toISOString().substring(0, 10); // YYYY-MM-DD
  }

  // Handle MM/DD/YYYY or M/D/YYYY format
  const dateMatch = String(dateStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * Clean numeric value
 */
function cleanNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[,"]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Upload and import NR raw data from CSV/XLSX
 * Processes 180k+ records → Aggregates → Calculates KPIs → Stores ~336 records
 */
export async function uploadRawData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📥 Reading NR raw data file...');
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // Delete file after reading
    deleteFile(req.file.path);
    
    if (rawData.length < 2) {
      return res.status(400).json({ error: 'File is empty or has no data rows' });
    }

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const firstCell = String(rawData[i][0] || '').toLowerCase();
      if (firstCell.includes('eniq') || firstCell.includes('date')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ 
        error: 'Could not find header row. Expected columns like Eniq_Name, DATE_ID, etc.' 
      });
    }

    const headers = rawData[headerRowIndex].map(h => String(h).trim());
    console.log(`📊 Found ${headers.length} columns, ${rawData.length - headerRowIndex - 1} data rows`);

    // Parse raw records
    const rawRecords = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0 || !row[0]) continue; // Skip empty rows
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      
      rawRecords.push(record);
    }

    console.log(`✅ Parsed ${rawRecords.length} raw records`);
    
    // Process raw data → Calculate KPIs
    console.log('🔄 Processing and calculating KPIs...');
    const kpiRecords = nrKpiService.processRawDataToKpis(rawRecords);
    console.log(`✅ Generated ${kpiRecords.length} KPI records`);

    // Insert KPI data to database
    console.log('💾 Inserting KPI data to database...');
    const result = await nrKpiService.insertKpiData(kpiRecords);

    res.json({
      success: true,
      message: 'NR KPI data imported successfully',
      rawRecords: rawRecords.length,
      kpiRecords: kpiRecords.length,
      inserted: result.inserted,
      updated: result.updated,
      total: result.total
    });
  } catch (error) {
    console.error('❌ Error importing NR data:', error);
    
    // Clean up file if it exists
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to import NR data',
      details: error.message
    });
  }
}

/**
 * Get NR KPI data for a date range
 */
export async function getKpiData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const data = await nrKpiService.getKpiData(startDate, endDate);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching NR KPI data:', error);
    res.status(500).json({
      error: 'Failed to fetch NR KPI data',
      details: error.message
    });
  }
}

/**
 * Delete NR KPI data for a date range
 */
export async function deleteKpiData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const deletedCount = await nrKpiService.deleteKpiData(startDate, endDate);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} records`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting NR KPI data:', error);
    res.status(500).json({
      error: 'Failed to delete NR KPI data',
      details: error.message
    });
  }
}

export default {
  uploadRawData,
  getKpiData,
  deleteKpiData
};
