import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kpi_reports',
  password: 'Kosova111',
  port: 5432,
});

async function checkData() {
  try {
    // Check nr_kpi_hourly_by_band table
    const count1 = await pool.query('SELECT COUNT(*) as count FROM nr_kpi_hourly_by_band');
    console.log('\n📊 nr_kpi_hourly_by_band table:');
    console.log('   Total records:', count1.rows[0].count);
    
    if (parseInt(count1.rows[0].count) > 0) {
      const sample1 = await pool.query(`
        SELECT date_id, hour_id, freq_band, partial_cell_availability_pct 
        FROM nr_kpi_hourly_by_band 
        ORDER BY date_id DESC, hour_id DESC 
        LIMIT 5
      `);
      console.log('   Sample records:');
      console.table(sample1.rows);
    }
    
    // Check nr_kpi_data table
    const count2 = await pool.query('SELECT COUNT(*) as count FROM nr_kpi_data');
    console.log('\n📊 nr_kpi_data table:');
    console.log('   Total records:', count2.rows[0].count);
    
    if (parseInt(count2.rows[0].count) > 0) {
      const sample2 = await pool.query(`
        SELECT date_id, hour_id, freq_band, endc_setup_success_rate 
        FROM nr_kpi_data 
        ORDER BY date_id DESC, hour_id DESC 
        LIMIT 5
      `);
      console.log('   Sample records:');
      console.table(sample2.rows);
    }
    
    // Test the joined query
    console.log('\n📊 Testing joined query with band mapping:');
    const joined = await pool.query(`
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
      WHERE b.date_id >= '2026-01-03' AND b.date_id <= '2026-01-03'
      ORDER BY COALESCE(a.date_id, b.date_id) DESC, COALESCE(a.hour_id, b.hour_id) DESC
      LIMIT 10
    `);
    console.log('   Joined query results (with mapping):');
    console.table(joined.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
