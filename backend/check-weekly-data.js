import pool from './db/pool.js';

(async () => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT 
        week_start_date, 
        week_number, 
        year, 
        COUNT(*) as records
      FROM nr_site_traffic_weekly 
      GROUP BY week_start_date, week_number, year 
      ORDER BY week_start_date DESC 
      LIMIT 5;
    `);
    
    console.log('\n📊 Recent weeks in database:');
    result.rows.forEach(r => {
      console.log(`  Week ${r.week_number}-${r.year}: ${r.week_start_date} (${r.records} records)`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
