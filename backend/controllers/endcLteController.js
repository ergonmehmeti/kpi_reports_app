import Papa from 'papaparse';
import fs from 'fs';
import * as endcLteService from '../services/endcLteService.js';
import { deleteFile } from '../utils/fileUpload.js';

/**
 * Upload and import EN-DC LTE traffic data from CSV
 * Processes LTE cell-level EN-DC data → Calculates traffic → Stores hourly data
 */
export async function uploadRawData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2);
    console.log(`📥 Reading EN-DC LTE raw data file (${fileSize} MB) with streaming...`);
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
          
          // Find header row - check for DATE_ID or EUtranCellFDD
          if (headers === null) {
            const firstCell = String(row[0] || '').toLowerCase().trim();
            const hasDateId = row.some(cell => String(cell || '').toUpperCase() === 'DATE_ID');
            const hasEUtranCell = row.some(cell => String(cell || '').toLowerCase().includes('eutrancell'));
            
            if (firstCell.includes('date') || hasDateId || hasEUtranCell) {
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
        error: 'Could not find header row. Expected columns like DATE_ID, EUtranCellFDD, etc.' 
      });
    }
    
    if (rawRecords.length === 0) {
      return res.status(400).json({ error: 'No data rows found' });
    }
    
    // Process raw data → Calculate EN-DC traffic
    console.log('🔄 Processing and calculating EN-DC traffic...');
    const startProcess = Date.now();
    const trafficRecords = endcLteService.processRawDataToTraffic(rawRecords);
    console.log(`✅ Generated ${trafficRecords.length} EN-DC traffic records in ${((Date.now() - startProcess) / 1000).toFixed(2)}s`);

    // Insert traffic data to database
    console.log('💾 Inserting EN-DC traffic data to database...');
    const startInsert = Date.now();
    const result = await endcLteService.insertTrafficData(trafficRecords);
    console.log(`✅ Inserted to DB in ${((Date.now() - startInsert) / 1000).toFixed(2)}s`);

    res.json({
      success: true,
      message: 'EN-DC LTE traffic data imported successfully',
      rawRecords: rawRecords.length,
      trafficRecords: trafficRecords.length,
      inserted: result.inserted,
      updated: result.updated,
      total: result.total
    });
  } catch (error) {
    console.error('❌ Error importing EN-DC LTE data:', error);
    
    // Clean up file if it exists
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to import EN-DC LTE data',
      details: error.message
    });
  }
}

/**
 * Get EN-DC LTE traffic data for a date range
 */
export async function getTrafficData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const data = await endcLteService.getTrafficData(startDate, endDate);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching EN-DC LTE traffic data:', error);
    res.status(500).json({
      error: 'Failed to fetch EN-DC LTE traffic data',
      details: error.message
    });
  }
}

/**
 * Get EN-DC LTE traffic data aggregated by date (daily totals)
 */
export async function getTrafficDataByDate(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const data = await endcLteService.getTrafficDataByDate(startDate, endDate);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching EN-DC LTE traffic data by date:', error);
    res.status(500).json({
      error: 'Failed to fetch EN-DC LTE traffic data by date',
      details: error.message
    });
  }
}

/**
 * Delete EN-DC LTE traffic data for a date range
 */
export async function deleteTrafficData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }

    const deletedCount = await endcLteService.deleteTrafficData(startDate, endDate);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} records`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting EN-DC LTE traffic data:', error);
    res.status(500).json({
      error: 'Failed to delete EN-DC LTE traffic data',
      details: error.message
    });
  }
}

export default {
  uploadRawData,
  getTrafficData,
  getTrafficDataByDate,
  deleteTrafficData
};
