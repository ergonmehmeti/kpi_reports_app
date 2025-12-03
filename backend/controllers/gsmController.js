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
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Delete file after reading
    deleteFile(req.file.path);

    if (data.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Process and insert data
    let inserted = 0;
    let updated = 0;
    let errors = [];

    await client.query('BEGIN');

    // Skip first row if it contains header names (from __EMPTY format)
    const startIndex = data[0]?.__EMPTY === 'Datetime' ? 1 : 0;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Get datetime field
        const datetimeField = getField(row, 'Datetime', 0) || 
                              getField(row, 'datetime', 0) || 
                              getField(row, 'DateTime', 0);
        
        if (!datetimeField) {
          errors.push(`Row ${i + 1}: Missing Datetime field`);
          continue;
        }
        
        const { date, hour } = parseDatetime(datetimeField, i + 1);

        // Build data object
        const kpiData = {
          date,
          hour,
          cell_availability: parseNumber(getField(row, 'Cell Availability', 1)),
          sdcch_congestion: parseNumber(getField(row, 'Signaling (SDCCH) Congestion', 2)),
          sdcch_drop_rate: parseNumber(getField(row, 'Signaling (SDCCH) Drop Rate', 3)),
          tch_traffic_volume: parseNumber(getField(row, 'Traffic Volume on Traffic Channels (TCH)', 4)),
          tch_assignment_success_rate: parseNumber(getField(row, 'Traffic Channel (TCH) Assignment Success Rate', 5)),
          subscriber_tch_congestion: parseNumber(getField(row, 'Subscriber Perceived TCH Congestion', 6)),
          call_drop_rate: parseNumber(getField(row, 'Call Drop Rate', 7)),
          call_minutes_per_drop: parseNumber(getField(row, 'Call Minutes Per Drop', 8)),
          handover_success_rate: parseNumber(getField(row, 'Handover Success Rate', 9)),
          handover_drop_rate: parseNumber(getField(row, 'Handover Drop Rate', 10)),
          good_voice_qual_ratio_ul: parseNumber(getField(row, 'Good Voice Qual Ratio UL', 11))
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
        totalRows: data.length - startIndex,
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
