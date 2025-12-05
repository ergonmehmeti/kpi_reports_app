import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// Fix timezone issue: Return DATE as string instead of JavaScript Date
// Type OID 1082 is DATE in PostgreSQL
types.setTypeParser(1082, (val) => val); // Return date as YYYY-MM-DD string

// Single database connection pool for the entire app
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kpi_reports',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database pool connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
