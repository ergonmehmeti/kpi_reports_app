/**
 * LTE Frequency Data Controller
 * Handles HTTP request/response logic for LTE frequency data endpoints
 */

import XLSX from 'xlsx';
import { parseNumber, getField } from '../utils/dataParser.js';
import { deleteFile } from '../utils/fileUpload.js';
import lteFrequencyService from '../services/lteFrequencyService.js';

/**
 * Parse datetime from CSV format (MM/DD/YYYY HH:MM or Excel serial number)
 * @param {string|number} datetimeStr - Datetime string or Excel serial number from CSV
 * @returns {string} - Formatted datetime (YYYY-MM-DD HH:MM:SS)
 */
function parseDate(datetimeStr) {
  if (!datetimeStr && datetimeStr !== 0) {
    throw new Error('Datetime is required');
  }

  // Handle Excel serial number (numeric date/datetime)
  if (typeof datetimeStr === 'number' || !isNaN(Number(datetimeStr))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Number(datetimeStr);
    const jsDate = new Date(excelEpoch.getTime() + days * 86400000);
    
    return jsDate.toISOString().replace('T', ' ').substring(0, 19);
  }

  // Handle MM/DD/YYYY HH:MM format (with time)
  const datetimeMatch = String(datetimeStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (datetimeMatch) {
    const [, month, day, year, hour, minute] = datetimeMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}:00`;
  }

  // Handle MM/DD/YYYY format (date only - set to midnight)
  const dateMatch = String(datetimeStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} 00:00:00`;
  }

  throw new Error(`Invalid datetime format: ${datetimeStr}. Expected MM/DD/YYYY HH:MM or Excel serial number`);
}

/**
 * Parse traffic value (handles comma as decimal separator)
 * @param {string|number} value - Traffic value
 * @returns {number|null}
 */
function parseTrafficValue(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Replace comma with dot for decimal separator
  const stringValue = String(value).replace(',', '.');
  const parsed = parseFloat(stringValue);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Upload and import LTE frequency data CSV file
 */
export async function uploadCSV(req, res) {
  const client = await lteFrequencyService.getClient();
  
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

    // Find the header row (first row that has 'Date' or 'date')
    let headerRowIndex = -1;
    let headerRow = null;
    
    for (let i = 0; i < rawData.length && i < 5; i++) {
      const row = rawData[i];
      const hasDate = row.some(cell => 
        cell && String(cell).toLowerCase().includes('date')
      );
      if (hasDate) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1 || !headerRow) {
      return res.status(400).json({ 
        error: 'Could not find header row with "Date" column',
        hint: 'CSV must have a header row with column names including "Date"'
      });
    }

    // Convert data rows to objects using the found header
    const data = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      const obj = {};
      headerRow.forEach((header, index) => {
        if (header) {
          obj[header] = row[index];
        }
      });
      data.push(obj);
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data rows found after header' });
    }
    
    // Validate required columns
    const requiredColumns = {
      datetime: ['Datetime', 'datetime', 'Date', 'date'],
      earfcndl: ['earfcndl', 'EARFCNDL', 'Earfcndl'],
      totalTraffic: ['Total LTE Traffic Volume (GB)', 'total lte traffic volume (gb)', 'total_traffic_gb']
    };

    const hasDatetime = requiredColumns.datetime.some(col => headerRow.includes(col));
    const hasEarfcndl = requiredColumns.earfcndl.some(col => headerRow.includes(col));
    const hasTotalTraffic = requiredColumns.totalTraffic.some(col => headerRow.includes(col));

    if (!hasDatetime || !hasEarfcndl || !hasTotalTraffic) {
      const missingCols = [];
      if (!hasDatetime) missingCols.push('Datetime');
      if (!hasEarfcndl) missingCols.push('earfcndl');
      if (!hasTotalTraffic) missingCols.push('Total LTE Traffic Volume (GB)');
      
      return res.status(400).json({ 
        error: `Invalid CSV format. Missing required columns: ${missingCols.join(', ')}`,
        hint: 'Expected columns: Datetime, earfcndl, Total LTE Traffic Volume (GB)',
        foundColumns: headerRow
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
        // Parse datetime - strict column name match only
        const datetimeField = row['Datetime'] || row['datetime'] || row['Date'] || row['date'];
        
        if (!datetimeField) {
          errors.push(`Row ${i + 1}: Missing Datetime field`);
          continue;
        }

        const datetime = parseDate(datetimeField);

        // Get frequency channel - strict column name match only
        const earfcndl = row['earfcndl'] || row['EARFCNDL'] || row['Earfcndl'];

        if (!earfcndl) {
          errors.push(`Row ${i + 1}: Missing earfcndl field`);
          continue;
        }

        // Build data object - strict column name match only
        const frequencyData = {
          datetime,
          earfcndl: parseInt(earfcndl),
          total_traffic_gb: parseTrafficValue(
            row['Total LTE Traffic Volume (GB)'] || 
            row['total lte traffic volume (gb)'] || 
            row['total_traffic_gb']
          )
        };

        const { isInsert } = await lteFrequencyService.upsertFrequencyRecord(client, frequencyData);
        
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
      message: 'LTE frequency data imported successfully',
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
    console.error('Error importing LTE frequency data:', error);
    res.status(500).json({ error: 'Error importing data', details: error.message });
  } finally {
    client.release();
  }
}

/**
 * Get frequency data with optional filtering
 */
export async function getData(req, res) {
  try {
    const { startDate, endDate, earfcndl } = req.query;
    
    const data = await lteFrequencyService.getFrequencyData({
      startDate,
      endDate,
      earfcndl: earfcndl ? parseInt(earfcndl) : undefined
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching LTE frequency data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
}

/**
 * Get available date range
 */
export async function getDateRange(req, res) {
  try {
    const dateRange = await lteFrequencyService.getDateRange();
    
    res.json({
      success: true,
      ...dateRange
    });
  } catch (error) {
    console.error('Error fetching date range:', error);
    res.status(500).json({ error: 'Error fetching date range', details: error.message });
  }
}

/**
 * Get list of unique frequencies
 */
export async function getFrequencyList(req, res) {
  try {
    const frequencies = await lteFrequencyService.getFrequencyList();
    
    res.json({
      success: true,
      count: frequencies.length,
      frequencies
    });
  } catch (error) {
    console.error('Error fetching frequency list:', error);
    res.status(500).json({ error: 'Error fetching frequencies', details: error.message });
  }
}

/**
 * Get aggregated statistics
 */
export async function getAggregatedStats(req, res) {
  try {
    const { startDate, endDate, groupBy = 'day', earfcndl } = req.query;
    
    const stats = await lteFrequencyService.getAggregatedStats({
      startDate,
      endDate,
      groupBy,
      earfcndl: earfcndl ? parseInt(earfcndl) : undefined
    });

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    res.status(500).json({ error: 'Error fetching statistics', details: error.message });
  }
}

export default {
  uploadCSV,
  getData,
  getDateRange,
  getFrequencyList,
  getAggregatedStats
};
