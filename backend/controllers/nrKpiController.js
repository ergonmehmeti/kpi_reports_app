import Papa from 'papaparse';
import fs from 'fs';
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

    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2);
    console.log(`📥 Reading NR raw data file (${fileSize} MB) with streaming...`);
    const startRead = Date.now();
    
    // Stream parse the file to avoid memory overflow
    const rawRecords = [];
    let headers = null;
    let headerRowIndex = -1;
    let rowIndex = 0;
    
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(req.file.path, { encoding: 'utf8' });
      
      Papa.parse(stream, {
        delimiter: '', // Auto-detect delimiter (comma, tab, etc.)
        skipEmptyLines: true,
        step: (result, parser) => {
          const row = result.data;
          
          // Debug first 3 rows
          if (rowIndex < 3) {
            console.log(`Row ${rowIndex}: [${row.length} cells] First cell: "${row[0]}", Second cell: "${row[1]}"`);
          }
          
          // Find header row - check for Eniq_Name or DATE_ID in any cell
          if (headers === null) {
            const firstCell = String(row[0] || '').toLowerCase().trim();
            const hasEniq = row.some(cell => String(cell || '').toLowerCase().includes('eniq'));
            const hasDateId = row.some(cell => String(cell || '').toUpperCase() === 'DATE_ID');
            
            if (firstCell.includes('eniq') || hasEniq || hasDateId) {
              headers = row.map(h => String(h || '').trim());
              headerRowIndex = rowIndex;
              console.log(`📊 Found ${headers.length} columns at row ${rowIndex}`);
              console.log(`📊 First 10 headers: ${headers.slice(0, 10).join(', ')}`);
              console.log(`📊 Has DATE_ID: ${headers.includes('DATE_ID')}, Has HOUR_ID: ${headers.includes('HOUR_ID')}`);
            }
            rowIndex++;
            return;
          }
          
          // Skip empty rows or rows where first cell is empty (like ,,,,,)
          const firstCellValue = String(row[0] || '').trim();
          if (!row || row.length === 0 || !firstCellValue) {
            rowIndex++;
            return;
          }
          
          // Build record object
          const record = {};
          headers.forEach((header, index) => {
            if (header) {
              record[header] = row[index] !== undefined ? row[index] : '';
            }
          });
          
          rawRecords.push(record);
          rowIndex++;
          
          // Progress indicator every 50k rows
          if (rawRecords.length % 50000 === 0) {
            console.log(`   ... processed ${rawRecords.length.toLocaleString()} records`);
          }
        },
        complete: () => {
          console.log(`✅ Streamed and parsed ${rawRecords.length.toLocaleString()} records in ${((Date.now() - startRead) / 1000).toFixed(2)}s`);
          resolve();
        },
        error: (error) => {
          reject(error);
        }
      });
    });
    
    // Delete file after reading
    deleteFile(req.file.path);
    
    if (!headers) {
      return res.status(400).json({ 
        error: 'Could not find header row. Expected columns like Eniq_Name, DATE_ID, etc.' 
      });
    }
    
    if (rawRecords.length === 0) {
      return res.status(400).json({ error: 'No data rows found' });
    }
    
    // Process raw data → Calculate KPIs
    console.log('🔄 Processing and calculating KPIs...');
    const startProcess = Date.now();
    const kpiRecords = nrKpiService.processRawDataToKpis(rawRecords);
    console.log(`✅ Generated ${kpiRecords.length} KPI records in ${((Date.now() - startProcess) / 1000).toFixed(2)}s`);

    // Insert KPI data to database
    console.log('💾 Inserting KPI data to database...');
    const startInsert = Date.now();
    const result = await nrKpiService.insertKpiData(kpiRecords);
    console.log(`✅ Inserted to DB in ${((Date.now() - startInsert) / 1000).toFixed(2)}s`);

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
