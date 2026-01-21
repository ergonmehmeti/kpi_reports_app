import Papa from 'papaparse';
import fs from 'fs';
import * as nrCellKpiService from '../services/nrCellKpiService.js';
import { deleteFile } from '../utils/fileUpload.js';

/**
 * Upload and import NR Cell raw data from CSV
 * Processes cell-level data → Aggregates → Calculates KPIs → Stores hourly + weekly data
 */
export async function uploadRawData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2);
    console.log(`📥 Reading NR Cell raw data file (${fileSize} MB) with streaming...`);
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
    
    // Process raw data → Calculate KPIs (hourly + weekly)
    console.log('🔄 Processing and calculating KPIs...');
    const startProcess = Date.now();
    const { hourlyKpis, weeklyTraffic } = nrCellKpiService.processRawDataToKpis(rawRecords);
    console.log(`✅ Generated ${hourlyKpis.length} hourly KPI records and ${weeklyTraffic.length} weekly traffic records in ${((Date.now() - startProcess) / 1000).toFixed(2)}s`);

    // Insert hourly KPI data to database
    console.log('💾 Inserting hourly KPI data to database...');
    const startInsertHourly = Date.now();
    const hourlyResult = await nrCellKpiService.insertHourlyKpiData(hourlyKpis);
    console.log(`✅ Inserted hourly KPIs to DB in ${((Date.now() - startInsertHourly) / 1000).toFixed(2)}s`);

    // Insert weekly traffic data to database
    console.log('💾 Inserting weekly traffic data to database...');
    const startInsertWeekly = Date.now();
    const weeklyResult = await nrCellKpiService.insertWeeklyTrafficData(weeklyTraffic);
    console.log(`✅ Inserted weekly traffic to DB in ${((Date.now() - startInsertWeekly) / 1000).toFixed(2)}s`);

    res.json({
      success: true,
      message: 'NR Cell KPI data imported successfully',
      rawRecords: rawRecords.length,
      hourlyKpis: {
        count: hourlyKpis.length,
        inserted: hourlyResult.inserted,
        updated: hourlyResult.updated,
        total: hourlyResult.total
      },
      weeklyTraffic: {
        count: weeklyTraffic.length,
        inserted: weeklyResult.inserted,
        updated: weeklyResult.updated,
        total: weeklyResult.total
      }
    });
  } catch (error) {
    console.error('❌ Error importing NR Cell data:', error);
    
    // Clean up file if it exists
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to import NR Cell data',
      details: error.message
    });
  }
}

/**
 * Get NR Cell KPI hourly data for a date range
 */
export async function getHourlyKpiData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const data = await nrCellKpiService.getHourlyKpiData(startDate, endDate);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching NR Cell KPI hourly data:', error);
    res.status(500).json({
      error: 'Failed to fetch NR Cell KPI hourly data',
      details: error.message
    });
  }
}

/**
 * Get NR Cell weekly traffic data for a date range
 */
export async function getWeeklyTrafficData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const data = await nrCellKpiService.getWeeklyTrafficData(startDate, endDate);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching NR Cell weekly traffic data:', error);
    res.status(500).json({
      error: 'Failed to fetch NR Cell weekly traffic data',
      details: error.message
    });
  }
}

/**
 * Delete NR Cell KPI hourly data for a date range
 */
export async function deleteHourlyKpiData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const deletedCount = await nrCellKpiService.deleteHourlyKpiData(startDate, endDate);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} hourly KPI records`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting NR Cell KPI hourly data:', error);
    res.status(500).json({
      error: 'Failed to delete NR Cell KPI hourly data',
      details: error.message
    });
  }
}

/**
 * Delete NR Cell weekly traffic data for a date range
 */
export async function deleteWeeklyTrafficData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const deletedCount = await nrCellKpiService.deleteWeeklyTrafficData(startDate, endDate);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} weekly traffic records`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting NR Cell weekly traffic data:', error);
    res.status(500).json({
      error: 'Failed to delete NR Cell weekly traffic data',
      details: error.message
    });
  }
}

export default {
  uploadRawData,
  getHourlyKpiData,
  getWeeklyTrafficData,
  deleteHourlyKpiData,
  deleteWeeklyTrafficData
};
