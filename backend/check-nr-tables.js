import pool from './db/pool.js';

async function checkNRData() {
    try {
        // List all tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('=== All Tables ===');
        console.log(tables.rows.map(r => r.table_name));

        // Check nr_site_traffic_weekly table
        console.log('\n=== nr_site_traffic_weekly sample ===');
        const nrWeekly = await pool.query(`SELECT * FROM nr_site_traffic_weekly LIMIT 5`);
        console.log('Columns:', nrWeekly.fields.map(f => f.name));
        console.log('Row count:', nrWeekly.rowCount);
        if (nrWeekly.rows.length > 0) {
            console.log('Sample:', nrWeekly.rows[0]);
        }

        // Check count and date range
        console.log('\n=== nr_site_traffic_weekly stats ===');
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_rows,
                COUNT(DISTINCT site_name) as unique_sites,
                MIN(week_start_date) as min_date,
                MAX(week_start_date) as max_date
            FROM nr_site_traffic_weekly
        `);
        console.log(stats.rows[0]);

        // Check for frequency band data
        console.log('\n=== Frequency bands in nr_site_traffic_weekly ===');
        const bands = await pool.query(`
            SELECT DISTINCT freq_band, COUNT(*) as count 
            FROM nr_site_traffic_weekly 
            GROUP BY freq_band
        `);
        console.log(bands.rows);

        // Check nr_kpi_hourly_by_band table
        console.log('\n=== nr_kpi_hourly_by_band sample ===');
        const nrHourly = await pool.query(`SELECT * FROM nr_kpi_hourly_by_band LIMIT 5`);
        console.log('Columns:', nrHourly.fields.map(f => f.name));
        console.log('Row count:', nrHourly.rowCount);
        
        // Check count and date range for hourly
        console.log('\n=== nr_kpi_hourly_by_band stats ===');
        const hourlyStats = await pool.query(`
            SELECT 
                COUNT(*) as total_rows,
                COUNT(DISTINCT nr_cell_name) as unique_cells,
                MIN(hour_timestamp) as min_date,
                MAX(hour_timestamp) as max_date
            FROM nr_kpi_hourly_by_band
        `);
        console.log(hourlyStats.rows[0]);

        // Check for frequency bands in hourly
        console.log('\n=== Frequency bands in nr_kpi_hourly_by_band ===');
        const hourlyBands = await pool.query(`
            SELECT DISTINCT frequency_band, COUNT(*) as count 
            FROM nr_kpi_hourly_by_band 
            GROUP BY frequency_band
        `);
        console.log(hourlyBands.rows);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
}

checkNRData();
