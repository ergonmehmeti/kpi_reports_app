import XLSX from 'xlsx';
import lteKpiService from '../services/lteKpiService.js';
import { deleteFile } from '../utils/fileUpload.js';

/**
 * Parse datetime from CSV (format: MM/DD/YYYY HH:MM or Excel serial number)
 */
function parseDate(datetimeStr) {
  if (!datetimeStr && datetimeStr !== 0) {
    return null;
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

  return null;
}

/**
 * Clean numeric value - remove commas and quotes
 */
function cleanNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  
  // Convert to string and remove commas and quotes
  const cleaned = String(value).replace(/[,"]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Upload and import LTE KPI data from CSV/XLSX
 */
export async function uploadKpiData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file from disk
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read with header:1 to get raw rows
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // Delete file after reading
    deleteFile(req.file.path);
    
    if (rawData.length < 2) {
      return res.status(400).json({ error: 'File is empty or has no data rows' });
    }

    // Find header row (look for "Datetime" or "datetime")
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const firstCell = String(rawData[i][0] || '').toLowerCase();
      if (firstCell.includes('datetime') || firstCell.includes('date')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ 
        error: 'Could not find header row. First column should be "Datetime"' 
      });
    }

    const headers = rawData[headerRowIndex];
    const dataRows = rawData.slice(headerRowIndex + 1);

    // Validate required KPI columns
    const requiredKpiColumns = [
      'cell availability (%)',
      'rrc connection establishment success (%)',
      'e-rab drop ratio-overall (%)',
      'average dl pdcp ue throughput overall (mbps)',
      'connected lte users (avg)'
    ];

    const normalizedHeaders = headers.map(h => String(h || '').toLowerCase().trim());
    const missingColumns = requiredKpiColumns.filter(col => 
      !normalizedHeaders.includes(col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        error: `Invalid LTE KPI CSV format. Missing required columns: ${missingColumns.join(', ')}`,
        hint: 'This appears to be a different CSV file. Please use the correct LTE KPI CSV file.',
        foundColumns: headers.slice(0, 10)
      });
    }

    // Map CSV headers to database columns (case-insensitive matching)
    const columnMapping = {
      'datetime': 'datetime',
      'cell availability (%)': 'cell_availability_pct',
      'cell unavailability due to fault (%)': 'cell_unavailability_fault_pct',
      'cell unavailability due to operation (%)': 'cell_unavailability_operation_pct',
      'rrc connection establishment success (%)': 'rrc_connection_success_pct',
      's1 connection establishment success (%)': 's1_connection_success_pct',
      'e-rab only establishment success (%)': 'erab_only_establishment_success_pct',
      'initial e-rab establishment success (%)': 'initial_erab_establishment_success_pct',
      'e-rab drop ratio-overall (%)': 'erab_drop_ratio_overall_pct',
      'e-rab drop due to mme (%)': 'erab_drop_mme_pct',
      'e-rab drop due to enb (%)': 'erab_drop_enb_pct',
      'e-rab drops per hour (overall)': 'erab_drops_per_hour_overall',
      'e-rab drops per hour due to mme': 'erab_drops_per_hour_mme',
      'e-rab drops per hour due to enb': 'erab_drops_per_hour_enb',
      'handover success ratio (%)': 'handover_success_ratio_pct',
      'handover execution succes ratio (%)': 'handover_execution_success_pct',
      'handover preparation succes ratio (%)': 'handover_preparation_success_pct',
      'average dl pdcp ue throughput overall (mbps)': 'avg_dl_pdcp_ue_throughput_overall_mbps',
      'average dl pdcp ue throughput with ca (mbps)': 'avg_dl_pdcp_ue_throughput_ca_mbps',
      '4g dl pdcp traffic volume with ca (gb)': 'dl_pdcp_traffic_volume_ca_gb',
      '4g dl pdcp traffic volume without ca (gb)': 'dl_pdcp_traffic_volume_without_ca_gb',
      '4g dl pdcp traffic volume overall (gb)': 'dl_pdcp_traffic_volume_overall_gb',
      'average ul pdcp ue throughput overall (mbps)': 'avg_ul_pdcp_ue_throughput_overall_mbps',
      '4g ul pdcp traffic volume overall (gb)': 'ul_pdcp_traffic_volume_overall_gb',
      '4g ul pdcp traffic volume with ca (gb)': 'ul_pdcp_traffic_volume_ca_gb',
      'connected lte users (avg)': 'connected_lte_users_avg',
      'connected lte user (max)': 'connected_lte_users_max',
      'average dl mac cell throughput (mbps)': 'avg_dl_mac_cell_throughput_mbps',
      '4g dl mac traffic volume (gb)': 'dl_mac_traffic_volume_gb',
      'average ul mac cell throughput (mbps)': 'avg_ul_mac_cell_throughput_mbps',
      '4g ul mac traffic volume (gb)': 'ul_mac_traffic_volume_gb',
      'downlink latency (ms)': 'downlink_latency_ms',
      'uplink packet loss (%)': 'uplink_packet_loss_pct'
    };

    // Parse data rows
    const records = [];
    let skippedRows = 0;

    for (const row of dataRows) {
      if (!row[0]) {
        skippedRows++;
        continue;
      }

      const datetime = parseDate(row[0]);
      if (!datetime) {
        skippedRows++;
        continue;
      }

      const record = { datetime };

      // Map each column value to database field
      for (let i = 1; i < headers.length; i++) {
        const header = String(headers[i] || '').toLowerCase().trim();
        const dbColumn = columnMapping[header];
        
        if (dbColumn) {
          record[dbColumn] = cleanNumber(row[i]);
        }
      }

      records.push(record);
    }

    if (records.length === 0) {
      return res.status(400).json({ 
        error: 'No valid data rows found after parsing' 
      });
    }

    // Insert records into database
    const result = await lteKpiService.insertKpiData(records);

    res.json({
      success: true,
      message: 'LTE KPI data imported successfully',
      stats: {
        totalRows: dataRows.length,
        inserted: result.inserted,
        updated: result.updated,
        errors: skippedRows
      }
    });

  } catch (error) {
    console.error('Error uploading LTE KPI data:', error);
    res.status(500).json({ 
      error: 'Failed to upload LTE KPI data', 
      details: error.message 
    });
  }
};

/**
 * Get LTE KPI data for a date range
 */
export async function getKpiData(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate are required' 
      });
    }

    const data = await lteKpiService.getKpiData(startDate, endDate);

    res.json({
      data,
      count: data.length
    });

  } catch (error) {
    console.error('Error fetching LTE KPI data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LTE KPI data', 
      details: error.message 
    });
  }
};

export default { uploadKpiData, getKpiData };
