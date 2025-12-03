/**
 * GSM KPI Service
 * Handles all database operations for GSM KPI data
 */

import pool from '../db/pool.js';

/**
 * Insert or update GSM KPI data
 * @param {object} data - KPI data object
 * @returns {Promise<{ isInsert: boolean }>}
 */
export async function upsertKpiRecord(client, data) {
  const query = `
    INSERT INTO gsm_kpi (
      date, hour,
      cell_availability, sdcch_congestion, sdcch_drop_rate,
      tch_traffic_volume, tch_assignment_success_rate, subscriber_tch_congestion,
      call_drop_rate, call_minutes_per_drop,
      handover_success_rate, handover_drop_rate, good_voice_qual_ratio_ul,
      imported_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (date, hour) DO UPDATE SET
      cell_availability = EXCLUDED.cell_availability,
      sdcch_congestion = EXCLUDED.sdcch_congestion,
      sdcch_drop_rate = EXCLUDED.sdcch_drop_rate,
      tch_traffic_volume = EXCLUDED.tch_traffic_volume,
      tch_assignment_success_rate = EXCLUDED.tch_assignment_success_rate,
      subscriber_tch_congestion = EXCLUDED.subscriber_tch_congestion,
      call_drop_rate = EXCLUDED.call_drop_rate,
      call_minutes_per_drop = EXCLUDED.call_minutes_per_drop,
      handover_success_rate = EXCLUDED.handover_success_rate,
      handover_drop_rate = EXCLUDED.handover_drop_rate,
      good_voice_qual_ratio_ul = EXCLUDED.good_voice_qual_ratio_ul,
      imported_at = NOW()
    RETURNING (xmax = 0) AS is_insert
  `;

  const values = [
    data.date,
    data.hour,
    data.cell_availability,
    data.sdcch_congestion,
    data.sdcch_drop_rate,
    data.tch_traffic_volume,
    data.tch_assignment_success_rate,
    data.subscriber_tch_congestion,
    data.call_drop_rate,
    data.call_minutes_per_drop,
    data.handover_success_rate,
    data.handover_drop_rate,
    data.good_voice_qual_ratio_ul
  ];

  const result = await client.query(query, values);
  return { isInsert: result.rows[0].is_insert };
}

/**
 * Get KPI data with optional date filtering
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getKpiData({ startDate, endDate } = {}) {
  let query = 'SELECT * FROM gsm_kpi';
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE date >= $1 AND date <= $2';
    params.push(startDate, endDate);
  } else if (startDate) {
    query += ' WHERE date >= $1';
    params.push(startDate);
  } else if (endDate) {
    query += ' WHERE date <= $1';
    params.push(endDate);
  }
  
  query += ' ORDER BY date, hour';
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get available date range in database
 * @returns {Promise<{ start_date: string, end_date: string, total_records: number }>}
 */
export async function getDateRange() {
  const result = await pool.query(`
    SELECT 
      MIN(date) as start_date,
      MAX(date) as end_date,
      COUNT(*) as total_records
    FROM gsm_kpi
  `);
  return result.rows[0];
}

/**
 * Get daily aggregated statistics
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getDailyStats({ startDate, endDate } = {}) {
  let query = `
    SELECT 
      date,
      ROUND(AVG(cell_availability)::numeric, 2) as avg_cell_availability,
      ROUND(AVG(sdcch_congestion)::numeric, 2) as avg_sdcch_congestion,
      ROUND(AVG(sdcch_drop_rate)::numeric, 2) as avg_sdcch_drop_rate,
      ROUND(SUM(tch_traffic_volume)::numeric, 2) as total_tch_traffic_volume,
      ROUND(AVG(tch_assignment_success_rate)::numeric, 2) as avg_tch_assignment_success_rate,
      ROUND(AVG(call_drop_rate)::numeric, 2) as avg_call_drop_rate,
      ROUND(AVG(handover_success_rate)::numeric, 2) as avg_handover_success_rate,
      ROUND(AVG(good_voice_qual_ratio_ul)::numeric, 2) as avg_good_voice_qual_ratio_ul
    FROM gsm_kpi
  `;
  
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE date >= $1 AND date <= $2';
    params.push(startDate, endDate);
  }
  
  query += ' GROUP BY date ORDER BY date';
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get a database client for transactions
 * @returns {Promise<PoolClient>}
 */
export async function getClient() {
  return await pool.connect();
}

export default {
  upsertKpiRecord,
  getKpiData,
  getDateRange,
  getDailyStats,
  getClient
};
