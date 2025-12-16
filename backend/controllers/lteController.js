/**
 * LTE Traffic Controller
 * Handles HTTP request/response logic for LTE daily site traffic endpoints
 */

import XLSX from 'xlsx';
import { parseNumber, getField } from '../utils/dataParser.js';
import { deleteFile } from '../utils/fileUpload.js';
import lteService from '../services/lteService.js';

/**
 * Parse date from CSV format (MM/DD/YYYY or Excel serial number) to YYYY-MM-DD
 * @param {string|number} dateStr - Date string or Excel serial number from CSV
 * @returns {string} - Formatted date (YYYY-MM-DD)
 */
function parseDate(dateStr) {
  if (!dateStr && dateStr !== 0) {
    throw new Error('Date is required');
  }

  // Handle Excel serial number (numeric date)
  if (typeof dateStr === 'number' || !isNaN(Number(dateStr))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Number(dateStr);
    const jsDate = new Date(excelEpoch.getTime() + days * 86400000);
    
    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Handle MM/DD/YYYY format
  const match = String(dateStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}. Expected MM/DD/YYYY or Excel serial number`);
  }

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * LTE CSV column mapping
 * Maps CSV column names to database field names
 */
const COLUMN_MAPPING = {
  date: { csv: 'Date', index: 0 },
  site_name: { csv: 'ERBS Name', index: 1 },
  total_traffic_gb: { csv: 'Total LTE Traffic Volume (GB)', index: 2 },
  ul_traffic_gb: { csv: '4G UL PDCP Total Traffic Volume (GB)', index: 3 },
  dl_traffic_gb: { csv: '4G DL PDCP Total Traffic Volume (GB)', index: 4 }
};

/**
 * Upload and import LTE daily site traffic CSV file
 */
export async function uploadCSV(req, res) {
  const client = await lteService.getClient();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read with header:1 to get raw rows, then manually set headers
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Delete file after reading
    deleteFile(req.file.path);

    if (rawData.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Find the header row (first non-empty row with 'Date' or 'ERBS Name')
    let headerRowIndex = -1;
    let headerRow = null;
    
    for (let i = 0; i < rawData.length && i < 5; i++) { // Check first 5 rows
      const row = rawData[i];
      const hasDate = row.some(cell => 
        cell && String(cell).toLowerCase() === 'date'
      );
      const hasERBS = row.some(cell => 
        cell && String(cell).toLowerCase().includes('erbs')
      );
      if (hasDate || hasERBS) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1 || !headerRow) {
      return res.status(400).json({ 
        error: 'Could not find header row with required columns',
        hint: 'CSV must have a header row with column names including "Date" and "ERBS Name"'
      });
    }

    // Convert data rows to objects using the found header
    const data = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.every(cell => !cell || String(cell).trim() === '')) {
        continue; // Skip empty rows
      }
      
      const rowObj = {};
      headerRow.forEach((header, index) => {
        if (header) {
          rowObj[header] = row[index];
        }
      });
      data.push(rowObj);
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data rows found in file' });
    }

    // Validate CSV has required columns by checking first row
    const firstRow = data[0];
    
    // Debug: Log actual column names
    console.log('🔍 Detected columns in CSV:', Object.keys(firstRow));
    
    const requiredColumns = {
      date: ['Date', 'date'],
      siteName: ['ERBS Name', 'erbs name', 'site_name'],
      totalTraffic: ['Total LTE Traffic Volume (GB)', 'total lte traffic volume (gb)', 'total_traffic_gb'],
      ulTraffic: ['4G UL PDCP Total Traffic Volume (GB)', '4g ul pdcp total traffic volume (gb)', 'ul_traffic_gb'],
      dlTraffic: ['4G DL PDCP Total Traffic Volume (GB)', '4g dl pdcp total traffic volume (gb)', 'dl_traffic_gb']
    };

    // Check if required columns exist (by name only, no index fallback)
    const hasDate = requiredColumns.date.some(col => col in firstRow);
    const hasSiteName = requiredColumns.siteName.some(col => col in firstRow);
    const hasTotalTraffic = requiredColumns.totalTraffic.some(col => col in firstRow);

    if (!hasDate || !hasSiteName || !hasTotalTraffic) {
      const missingCols = [];
      if (!hasDate) missingCols.push('Date');
      if (!hasSiteName) missingCols.push('ERBS Name');
      if (!hasTotalTraffic) missingCols.push('Total LTE Traffic Volume (GB)');
      
      return res.status(400).json({ 
        error: `Invalid CSV format. Missing required columns: ${missingCols.join(', ')}`,
        hint: 'Expected columns: Date, ERBS Name, Total LTE Traffic Volume (GB), 4G UL PDCP Total Traffic Volume (GB), 4G DL PDCP Total Traffic Volume (GB)'
      });
    }

    // Process and insert data
    let inserted = 0;
    let updated = 0;
    let errors = [];

    await client.query('BEGIN');

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Parse date - strict column name match only
        const dateField = row['Date'] || row['date'];
        
        if (!dateField) {
          errors.push(`Row ${i + 1}: Missing Date field`);
          continue;
        }

        const date = parseDate(dateField);

        // Get site name - strict column name match only
        const siteName = row['ERBS Name'] || row['erbs name'] || row['site_name'];

        if (!siteName) {
          errors.push(`Row ${i + 1}: Missing ERBS Name field`);
          continue;
        }

        // Build data object - strict column name match only
        const trafficData = {
          date,
          site_name: String(siteName).trim(),
          total_traffic_gb: parseNumber(
            row['Total LTE Traffic Volume (GB)'] || 
            row['total lte traffic volume (gb)'] || 
            row['total_traffic_gb']
          ),
          ul_traffic_gb: parseNumber(
            row['4G UL PDCP Total Traffic Volume (GB)'] || 
            row['4g ul pdcp total traffic volume (gb)'] || 
            row['ul_traffic_gb']
          ),
          dl_traffic_gb: parseNumber(
            row['4G DL PDCP Total Traffic Volume (GB)'] || 
            row['4g dl pdcp total traffic volume (gb)'] || 
            row['dl_traffic_gb']
          )
        };

        const { isInsert } = await lteService.upsertTrafficRecord(client, trafficData);
        
        if (isInsert) {
          inserted++;
        } else {
          updated++;
        }
        
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'LTE site traffic data imported successfully',
      filename: req.file.originalname,
      stats: {
        totalRows: data.length,
        inserted,
        updated,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing LTE data:', error);
    res.status(500).json({ error: 'Error importing data', details: error.message });
  } finally {
    client.release();
  }
}

/**
 * Get LTE traffic data with optional filtering
 */
export async function getData(req, res) {
  try {
    const { startDate, endDate, siteName, siteNames } = req.query;
    
    // Parse siteNames if it's a comma-separated string
    const siteNamesArray = siteNames ? siteNames.split(',').map(s => s.trim()) : undefined;
    
    const data = await lteService.getTrafficData({ 
      startDate, 
      endDate, 
      siteName,
      siteNames: siteNamesArray
    });
    
    res.json({
      success: true,
      count: data.length,
      data
    });
    
  } catch (error) {
    console.error('Error fetching LTE data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
}

/**
 * Get available date range in database
 */
export async function getDateRange(req, res) {
  try {
    const range = await lteService.getDateRange();
    
    res.json({
      success: true,
      ...range
    });
    
  } catch (error) {
    console.error('Error fetching date range:', error);
    res.status(500).json({ error: 'Error fetching date range', details: error.message });
  }
}

/**
 * Get list of unique sites
 */
export async function getSiteList(req, res) {
  try {
    const sites = await lteService.getSiteList();
    
    res.json({
      success: true,
      count: sites.length,
      sites
    });
    
  } catch (error) {
    console.error('Error fetching site list:', error);
    res.status(500).json({ error: 'Error fetching site list', details: error.message });
  }
}

/**
 * Get aggregated statistics
 */
export async function getAggregatedStats(req, res) {
  try {
    const { startDate, endDate, groupBy, siteName } = req.query;
    const data = await lteService.getAggregatedStats({ 
      startDate, 
      endDate, 
      groupBy: groupBy || 'day',
      siteName
    });
    
    res.json({
      success: true,
      count: data.length,
      groupBy: groupBy || 'day',
      data
    });
    
  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    res.status(500).json({ error: 'Error fetching stats', details: error.message });
  }
}

export default {
  uploadCSV,
  getData,
  getDateRange,
  getSiteList,
  getAggregatedStats
};
