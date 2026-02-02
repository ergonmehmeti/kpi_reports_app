import pool from '../db/pool.js';

/**
 * Parse date from Excel serial number or MM/DD/YYYY format
 */
function parseDate(dateValue) {
  if (!dateValue && dateValue !== 0) return null;

  // Handle Excel serial number (numeric)
  if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Number(dateValue);
    const jsDate = new Date(excelEpoch.getTime() + days * 86400000);
    return jsDate.toISOString().substring(0, 10); // YYYY-MM-DD
  }

  // Handle MM/DD/YYYY or M/D/YYYY format
  const dateMatch = String(dateValue).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * Extract site name from LTE cell name (e.g., abria_L18_1 -> abria)
 */
function extractSiteName(cellName) {
  if (!cellName) return null;
  const parts = String(cellName).split('_');
  return parts[0] || null;
}

/**
 * Determine LTE frequency band from FREQUENCY column or cell name
 */
function determineFreqBand(frequency, cellName) {
  // Priority 1: Use FREQUENCY column if available
  if (frequency) {
    const freqStr = String(frequency).toLowerCase();
    if (freqStr.includes('1800') || freqStr.includes('18')) return '1800MHz';
    if (freqStr.includes('2600') || freqStr.includes('26')) return '2600MHz';
    if (freqStr.includes('800') || freqStr.includes('08')) return '800MHz';
    if (freqStr.includes('2100') || freqStr.includes('21')) return '2100MHz';
  }
  
  // Priority 2: Try to extract from cell name (e.g., _L18_ = 1800MHz)
  if (cellName) {
    const cellStr = String(cellName).toUpperCase();
    if (cellStr.includes('_L18_')) return '1800MHz';
    if (cellStr.includes('_L26_')) return '2600MHz';
    if (cellStr.includes('_L08_')) return '800MHz';
    if (cellStr.includes('_L21_')) return '2100MHz';
  }
  
  return 'Unknown';
}

/**
 * Process raw LTE EN-DC CSV data and calculate network-wide hourly traffic
 * @param {Array} rawRecords - Raw CSV records from pm_DC_E_ERBS_EUTRANCELLFDD_FLEX_HOUR
 * @returns {Array} EN-DC traffic records aggregated by date/hour (network-wide)
 */
export const processRawDataToTraffic = (rawRecords) => {
  // Group by date_id and hour_id only (network-wide aggregation)
  const groups = {};
  
  rawRecords.forEach(record => {
    const dateId = parseDate(record.DATE_ID);
    const hourId = parseInt(record.HOUR_ID);
    
    // Skip invalid records
    if (!dateId || isNaN(hourId)) {
      console.warn('Skipping invalid record:', { DATE_ID: record.DATE_ID, HOUR_ID: record.HOUR_ID });
      return;
    }
    
    const key = `${dateId}_${hourId}`;
    
    if (!groups[key]) {
      groups[key] = {
        dateId,
        hourId,
        // EN-DC traffic counters (sum across all cells)
        pmFlexPdcpVolDlDrbEndc: 0,
        pmFlexPdcpVolUlDrbEndc: 0,
      };
    }
    
    // Aggregate EN-DC traffic counters from all cells (SUM)
    const group = groups[key];
    group.pmFlexPdcpVolDlDrbEndc += parseFloat(record['PMFLEXPDCPVOLDLDRB[Endc2To99]'] || 0);
    group.pmFlexPdcpVolUlDrbEndc += parseFloat(record['PMFLEXPDCPVOLULDRB[Endc2To99]'] || 0);
  });
  
  // Calculate EN-DC traffic using the formula: 8*(DL + UL)/(1000*1000)
  const trafficRecords = Object.values(groups).map(g => {
    // Formula from document: 8*(PMFLEXPDCPVOLDLDRB[Endc2To99] + PMFLEXPDCPVOLULDRB[Endc2To99])/(1000*1000)
    const endcTotalTrafficVolume = (8 * (g.pmFlexPdcpVolDlDrbEndc + g.pmFlexPdcpVolUlDrbEndc)) / (1000 * 1000);
    
    return {
      date_id: g.dateId,
      hour_id: g.hourId,
      endc_total_traffic_volume_gb: endcTotalTrafficVolume,
    };
  });
  
  return trafficRecords;
};

/**
 * Insert EN-DC LTE traffic data (UPSERT) - Network-wide hourly totals
 */
export const insertTrafficData = async (records) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      const query = `
        INSERT INTO endc_lte_traffic_hourly (
          date_id, hour_id, endc_total_traffic_volume_gb
        ) VALUES ($1, $2, $3)
        ON CONFLICT (date_id, hour_id)
        DO UPDATE SET
          endc_total_traffic_volume_gb = EXCLUDED.endc_total_traffic_volume_gb,
          created_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const result = await client.query(query, [
        record.date_id,
        record.hour_id,
        record.endc_total_traffic_volume_gb,
      ]);
      
      if (result.rows[0].inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      total: records.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get EN-DC LTE traffic data for a date range
 */
export const getTrafficData = async (startDate, endDate) => {
  const query = `
    SELECT *
    FROM endc_lte_traffic_hourly
    WHERE date_id >= $1 AND date_id <= $2
    ORDER BY date_id, hour_id, lte_cell_name;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

/**
 * Get EN-DC LTE traffic data aggregated by site
 */
export const getTrafficDataBySite = async (startDate, endDate) => {
  const query = `
    SELECT 
      date_id,
      site_name,
      freq_band,
      SUM(endc_traffic_volume_dl_gb) as total_dl_gb,
      SUM(endc_traffic_volume_ul_gb) as total_ul_gb,
      SUM(endc_total_traffic_volume_gb) as total_gb
    FROM endc_lte_traffic_hourly
    WHERE date_id >= $1 AND date_id <= $2date (daily totals)
 */
export const getTrafficDataByDate = async (startDate, endDate) => {
  const query = `
    SELECT 
      date_id,
      SUM(endc_total_traffic_volume_gb) as total_gb
    FROM endc_lte_traffic_hourly
    WHERE date_id >= $1 AND date_id <= $2
    GROUP BY date_id
    ORDER BY date_i
    WHERE date_id >= $1 AND date_id <= $2;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rowCount;
};
