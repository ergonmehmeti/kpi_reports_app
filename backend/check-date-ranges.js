import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kpi_reports',
  password: 'Kosova111',
  port: 5432,
});

async function checkDateRanges() {
  try {
    console.log('\n📅 Date ranges in tables:\n');
    
    // Check nr_kpi_data date range
    const kpiDateRange = await pool.query(`
      SELECT 
        MIN(date_id) as min_date,
        MAX(date_id) as max_date,
        COUNT(*) as total_records
      FROM nr_kpi_data
    `);
    console.log('nr_kpi_data table:');
    console.log('  Min date:', kpiDateRange.rows[0].min_date);
    console.log('  Max date:', kpiDateRange.rows[0].max_date);
    console.log('  Records:', kpiDateRange.rows[0].total_records);
    
    // Check nr_kpi_hourly_by_band date range
    const hourlyDateRange = await pool.query(`
      SELECT 
        MIN(date_id) as min_date,
        MAX(date_id) as max_date,
        COUNT(*) as total_records
      FROM nr_kpi_hourly_by_band
    `);
    console.log('\nnr_kpi_hourly_by_band table:');
    console.log('  Min date:', hourlyDateRange.rows[0].min_date);
    console.log('  Max date:', hourlyDateRange.rows[0].max_date);
    console.log('  Records:', hourlyDateRange.rows[0].total_records);
    
    // Test API query with the date range from nr_kpi_hourly_by_band
    const startDate = hourlyDateRange.rows[0].min_date.toISOString().split('T')[0];
    const endDate = hourlyDateRange.rows[0].max_date.toISOString().split('T')[0];
    
    console.log(`\n🔍 Testing API query with date range: ${startDate} to ${endDate}`);
    
    const apiResult = await pool.query(`
      SELECT 
        COALESCE(a.date_id, b.date_id) as date_id,
        COALESCE(a.hour_id, b.hour_id) as hour_id,
        COALESCE(a.freq_band, 
          CASE 
            WHEN b.freq_band = '8' THEN '900MHz'
            WHEN b.freq_band = '78' THEN '3500MHz'
            ELSE b.freq_band
          END
        ) as freq_band,
        a.endc_setup_success_rate,
        b.partial_cell_availability_pct
      FROM nr_kpi_data a
      FULL OUTER JOIN nr_kpi_hourly_by_band b 
        ON a.date_id = b.date_id 
        AND a.hour_id = b.hour_id 
        AND a.freq_band = CASE 
          WHEN b.freq_band = '8' THEN '900MHz'
          WHEN b.freq_band = '78' THEN '3500MHz'
          ELSE b.freq_band
        END
      WHERE (a.date_id >= $1 AND a.date_id <= $2) OR (b.date_id >= $1 AND b.date_id <= $2)
      ORDER BY COALESCE(a.date_id, b.date_id) DESC, COALESCE(a.hour_id, b.hour_id) DESC
      LIMIT 10
    `, [startDate, endDate]);
    
    console.log('\nAPI Result (first 10 records):');
    console.table(apiResult.rows);
    
    // Count records with partial_cell_availability_pct
    const withAvailability = apiResult.rows.filter(r => r.partial_cell_availability_pct !== null).length;
    console.log(`\n✅ Records with partial_cell_availability_pct: ${withAvailability} out of 10`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDateRanges();
