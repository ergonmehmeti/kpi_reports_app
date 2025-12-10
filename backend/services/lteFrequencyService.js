/**
 * LTE Frequency Data Service
 * Database operations for LTE frequency data
 */

import pool from '../db/pool.js';

/**
 * Get a database client (for transactions)
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Insert or update frequency data record
 * @param {Object} client - Database client
 * @param {Object} data - Frequency data object
 * @returns {Object} { isInsert: boolean }
 */
export async function upsertFrequencyRecord(client, data) {
  const query = `
    INSERT INTO lte_frequency_data (
      datetime, earfcndl, total_traffic_gb
    ) VALUES ($1, $2, $3)
    ON CONFLICT (datetime, earfcndl)
    DO UPDATE SET
      total_traffic_gb = EXCLUDED.total_traffic_gb,
      updated_at = CURRENT_TIMESTAMP
    RETURNING (xmax = 0) AS is_insert
  `;

  const values = [
    data.datetime,
    data.earfcndl,
    data.total_traffic_gb
  ];

  const result = await client.query(query, values);
  return { isInsert: result.rows[0].is_insert };
}

/**
 * Get frequency data with optional filtering
 */
export async function getFrequencyData(filters = {}) {
  const { startDate, endDate, earfcndl } = filters;
  
  let query = 'SELECT * FROM lte_frequency_data WHERE 1=1';
  const values = [];
  let paramCount = 1;

  if (startDate) {
    query += ` AND datetime >= $${paramCount}::timestamp`;
    values.push(startDate);
    paramCount++;
  }

  if (endDate) {
    // Add 1 day to include the entire end date (all hours)
    query += ` AND datetime < ($${paramCount}::date + interval '1 day')`;
    values.push(endDate);
    paramCount++;
  }

  if (earfcndl) {
    query += ` AND earfcndl = $${paramCount}`;
    values.push(earfcndl);
    paramCount++;
  }

  query += ' ORDER BY datetime ASC, earfcndl ASC';

  const result = await pool.query(query, values);
  return result.rows;
}

/**
 * Get available date range
 */
export async function getDateRange() {
  const query = `
    SELECT 
      MIN(datetime) as min_date,
      MAX(datetime) as max_date,
      COUNT(DISTINCT DATE(datetime)) as total_days
    FROM lte_frequency_data
  `;
  
  const result = await pool.query(query);
  return result.rows[0];
}

/**
 * Get list of unique frequencies
 */
export async function getFrequencyList() {
  const query = `
    SELECT DISTINCT earfcndl
    FROM lte_frequency_data
    ORDER BY earfcndl ASC
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.earfcndl);
}

/**
 * Get aggregated statistics by time period
 */
export async function getAggregatedStats(filters = {}) {
  const { startDate, endDate, groupBy = 'day', earfcndl } = filters;
  
  let dateFormat;
  switch (groupBy) {
    case 'week':
      dateFormat = "TO_CHAR(datetime, 'IYYY-IW')";
      break;
    case 'month':
      dateFormat = "TO_CHAR(datetime, 'YYYY-MM')";
      break;
    case 'year':
      dateFormat = "TO_CHAR(datetime, 'YYYY')";
      break;
    default:
      dateFormat = "DATE(datetime)::text";
  }

  let query = `
    SELECT 
      ${dateFormat} as period,
      MIN(datetime) as datetime,
      SUM(total_traffic_gb) as total_traffic_gb,
      COUNT(DISTINCT earfcndl) as frequency_count
    FROM lte_frequency_data
    WHERE 1=1
  `;

  const values = [];
  let paramCount = 1;

  if (startDate) {
    query += ` AND datetime >= $${paramCount}`;
    values.push(startDate);
    paramCount++;
  }

  if (endDate) {
    query += ` AND datetime <= $${paramCount}`;
    values.push(endDate);
    paramCount++;
  }

  if (earfcndl) {
    query += ` AND earfcndl = $${paramCount}`;
    values.push(earfcndl);
    paramCount++;
  }

  query += ` GROUP BY period ORDER BY period ASC`;

  const result = await pool.query(query, values);
  return result.rows;
}

export default {
  getClient,
  upsertFrequencyRecord,
  getFrequencyData,
  getDateRange,
  getFrequencyList,
  getAggregatedStats
};
