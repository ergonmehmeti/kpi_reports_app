/**
 * GSM KPI Controller
 * Handles HTTP request/response logic for GSM KPI endpoints
 */

import XLSX from 'xlsx';
import { parseDatetime } from '../utils/dateParser.js';
import { parseNumber, getField } from '../utils/dataParser.js';
import { deleteFile } from '../utils/fileUpload.js';
import gsmService from '../services/gsmService.js';

/**
 * GSM KPI column mapping
 * Maps CSV column names to database field names
 * Note: CSV 'Datetime' is parsed into separate 'date' and 'hour' columns in DB
 */
const COLUMN_MAPPING = {
  // CSV Datetime → split into date (DATE) + hour (INTEGER 0-23)
  datetime: { csv: 'Datetime', index: 0 },
  
  // KPI columns
  cell_availability: { csv: 'Cell Availability', index: 1 },
  sdcch_congestion: { csv: 'Signaling (SDCCH) Congestion', index: 2 },
  sdcch_drop_rate: { csv: 'Signaling (SDCCH) Drop Rate', index: 3 },
  tch_traffic_volume: { csv: 'Traffic Volume on Traffic Channels (TCH)', index: 4 },
  tch_assignment_success_rate: { csv: 'Traffic Channel (TCH) Assignment Success Rate', index: 5 },
  subscriber_tch_congestion: { csv: 'Subscriber Perceived TCH Congestion', index: 6 },
  call_drop_rate: { csv: 'Call Drop Rate', index: 7 },
  call_minutes_per_drop: { csv: 'Call Minutes Per Drop', index: 8 },
  handover_success_rate: { csv: 'Handover Success Rate', index: 9 },
  handover_drop_rate: { csv: 'Handover Drop Rate', index: 10 },
  good_voice_qual_ratio_ul: { csv: 'Good Voice Qual Ratio UL', index: 11 }
};

/**
 * Upload and import GSM KPI CSV file
 */
export async function uploadCSV(req, res) {
  const client = await gsmService.getClient();
  
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

    // Find the header row (first non-empty row)
    let headerRowIndex = -1;
    let headerRow = null;
    
    for (let i = 0; i < rawData.length && i < 5; i++) { // Check first 5 rows
      const row = rawData[i];
      const hasDatetime = row.some(cell => 
        cell && String(cell).toLowerCase().includes('datetime')
      );
      if (hasDatetime) {
        headerRowIndex = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIndex === -1 || !headerRow) {
      return res.status(400).json({ 
        error: 'Could not find header row with "Datetime" column',
        hint: 'CSV must have a header row with column names including "Datetime"'
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
    console.log('📋 GSM CSV columns found:', headerRow);
    
    const requiredColumns = {
      datetime: ['Datetime', 'datetime', 'DateTime'],
      cellAvailability: ['Cell Availability', 'cell availability'],
      callDropRate: ['Call Drop Rate', 'call drop rate']
    };

    const hasDatetime = requiredColumns.datetime.some(col => headerRow.includes(col));
    const hasCellAvailability = requiredColumns.cellAvailability.some(col => headerRow.includes(col));
    const hasCallDropRate = requiredColumns.callDropRate.some(col => headerRow.includes(col));

    if (!hasDatetime || !hasCellAvailability || !hasCallDropRate) {
      const missingCols = [];
      if (!hasDatetime) missingCols.push('Datetime');
      if (!hasCellAvailability) missingCols.push('Cell Availability');
      if (!hasCallDropRate) missingCols.push('Call Drop Rate');
      
      return res.status(400).json({ 
        error: `Invalid CSV format. Missing required columns: ${missingCols.join(', ')}`,
        hint: 'Expected columns: Datetime, Cell Availability, Call Drop Rate, and other GSM KPI metrics',
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
        // Get datetime field - strict column name match only
        const datetimeField = row['Datetime'] || row['datetime'] || row['DateTime'];
        
        if (!datetimeField) {
          errors.push(`Row ${i + 1}: Missing Datetime field`);
          continue;
        }
        
        const { date, hour } = parseDatetime(datetimeField, i + 1);

        // Build data object - strict column name match only
        const kpiData = {
          date,
          hour,
          cell_availability: parseNumber(row['Cell Availability'] || row['cell availability']),
          sdcch_congestion: parseNumber(row['Signaling (SDCCH) Congestion'] || row['signaling (sdcch) congestion']),
          sdcch_drop_rate: parseNumber(row['Signaling (SDCCH) Drop Rate'] || row['signaling (sdcch) drop rate']),
          tch_traffic_volume: parseNumber(row['Traffic Volume on Traffic Channels (TCH)'] || row['traffic volume on traffic channels (tch)']),
          tch_assignment_success_rate: parseNumber(row['Traffic Channel (TCH) Assignment Success Rate'] || row['traffic channel (tch) assignment success rate']),
          subscriber_tch_congestion: parseNumber(row['Subscriber Perceived TCH Congestion'] || row['subscriber perceived tch congestion']),
          call_drop_rate: parseNumber(row['Call Drop Rate'] || row['call drop rate']),
          call_minutes_per_drop: parseNumber(row['Call Minutes Per Drop'] || row['call minutes per drop']),
          handover_success_rate: parseNumber(row['Handover Success Rate'] || row['handover success rate']),
          handover_drop_rate: parseNumber(row['Handover Drop Rate'] || row['handover drop rate']),
          good_voice_qual_ratio_ul: parseNumber(row['Good Voice Qual Ratio UL'] || row['good voice qual ratio ul'])
        };

        const { isInsert } = await gsmService.upsertKpiRecord(client, kpiData);
        
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
      message: 'GSM KPI data imported successfully',
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
    console.error('Error importing GSM data:', error);
    res.status(500).json({ error: 'Error importing data', details: error.message });
  } finally {
    client.release();
  }
}

/**
 * Get GSM KPI data with optional date filtering
 */
export async function getData(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await gsmService.getKpiData({ startDate, endDate });
    
    res.json({
      success: true,
      count: data.length,
      data
    });
    
  } catch (error) {
    console.error('Error fetching GSM data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
}

/**
 * Get available date range in database
 */
export async function getDateRange(req, res) {
  try {
    const range = await gsmService.getDateRange();
    
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
 * Get daily aggregated stats
 */
export async function getDailyStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const data = await gsmService.getDailyStats({ startDate, endDate });
    
    res.json({
      success: true,
      count: data.length,
      data
    });
    
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Error fetching stats', details: error.message });
  }
}

export default {
  uploadCSV,
  getData,
  getDateRange,
  getDailyStats
};
