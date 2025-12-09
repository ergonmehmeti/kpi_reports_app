/**
 * LTE Service
 * Handles all database operations for LTE daily site traffic data
 */

import pool from '../db/pool.js';

/**
 * Get a database client from the pool
 * @returns {Promise<PoolClient>}
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Insert or update LTE daily site traffic record
 * @param {PoolClient} client - Database client
 * @param {object} data - Traffic data object
 * @returns {Promise<{ isInsert: boolean }>}
 */
export async function upsertTrafficRecord(client, data) {
  const query = `
    INSERT INTO lte_daily_site_traffic (
      date, site_name,
      total_traffic_gb, ul_traffic_gb, dl_traffic_gb,
      imported_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (date, site_name) DO UPDATE SET
      total_traffic_gb = EXCLUDED.total_traffic_gb,
      ul_traffic_gb = EXCLUDED.ul_traffic_gb,
      dl_traffic_gb = EXCLUDED.dl_traffic_gb,
      imported_at = NOW()
    RETURNING (xmax = 0) AS is_insert
  `;

  const values = [
    data.date,
    data.site_name,
    data.total_traffic_gb,
    data.ul_traffic_gb,
    data.dl_traffic_gb
  ];

  const result = await client.query(query, values);
  return { isInsert: result.rows[0].is_insert };
}

/**
 * Get traffic data with optional date and site filtering
 * @param {object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getTrafficData({ startDate, endDate, siteName, siteNames } = {}) {
  let query = `
    SELECT 
      date, site_name,
      total_traffic_gb, ul_traffic_gb, dl_traffic_gb
    FROM lte_daily_site_traffic
  `;
  const params = [];
  const conditions = [];
  let paramCounter = 1;

  // Date range filtering
  if (startDate && endDate) {
    conditions.push(`date >= $${paramCounter} AND date <= $${paramCounter + 1}`);
    params.push(startDate, endDate);
    paramCounter += 2;
  } else if (startDate) {
    conditions.push(`date >= $${paramCounter}`);
    params.push(startDate);
    paramCounter++;
  } else if (endDate) {
    conditions.push(`date <= $${paramCounter}`);
    params.push(endDate);
    paramCounter++;
  }

  // Single site filtering
  if (siteName) {
    conditions.push(`site_name = $${paramCounter}`);
    params.push(siteName);
    paramCounter++;
  }

  // Multiple sites filtering
  if (siteNames && Array.isArray(siteNames) && siteNames.length > 0) {
    const placeholders = siteNames.map((_, i) => `$${paramCounter + i}`).join(', ');
    conditions.push(`site_name IN (${placeholders})`);
    params.push(...siteNames);
    paramCounter += siteNames.length;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date, site_name';
  query += ' LIMIT 10000'; // Safety limit

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get available date range in database
 * @returns {Promise<{ start_date: string, end_date: string, total_records: number }>}
 */
export async function getDateRange() {
  const query = `
    SELECT 
      MIN(date) as start_date,
      MAX(date) as end_date,
      COUNT(*) as total_records
    FROM lte_daily_site_traffic
  `;
  
  const result = await pool.query(query);
  return result.rows[0];
}

/**
 * Get list of unique site names
 * @returns {Promise<Array<string>>}
 */
export async function getSiteList() {
  const query = `
    SELECT DISTINCT site_name
    FROM lte_daily_site_traffic
    ORDER BY site_name
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.site_name);
}

/**
 * Get aggregated statistics by time period
 * @param {object} options - Aggregation options
 * @returns {Promise<Array>}
 */
export async function getAggregatedStats({ startDate, endDate, groupBy = 'day', siteName } = {}) {
  let dateGrouping;
  
  switch (groupBy) {
    case 'week':
      dateGrouping = `EXTRACT(YEAR FROM date) as year, EXTRACT(WEEK FROM date) as week`;
      break;
    case 'month':
      dateGrouping = `EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as month`;
      break;
    case 'year':
      dateGrouping = `EXTRACT(YEAR FROM date) as year`;
      break;
    default: // day
      dateGrouping = `date`;
  }

  let query = `
    SELECT 
      ${dateGrouping},
      site_name,
      SUM(total_traffic_gb) as total_traffic_gb,
      SUM(ul_traffic_gb) as ul_traffic_gb,
      SUM(dl_traffic_gb) as dl_traffic_gb,
      COUNT(*) as days_count
    FROM lte_daily_site_traffic
  `;
  
  const params = [];
  const conditions = [];
  let paramCounter = 1;

  if (startDate && endDate) {
    conditions.push(`date >= $${paramCounter} AND date <= $${paramCounter + 1}`);
    params.push(startDate, endDate);
    paramCounter += 2;
  }

  if (siteName) {
    conditions.push(`site_name = $${paramCounter}`);
    params.push(siteName);
    paramCounter++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` GROUP BY ${dateGrouping}, site_name`;
  query += ` ORDER BY ${dateGrouping}, site_name`;

  const result = await pool.query(query, params);
  return result.rows;
}

export default {
  getClient,
  upsertTrafficRecord,
  getTrafficData,
  getDateRange,
  getSiteList,
  getAggregatedStats
};
