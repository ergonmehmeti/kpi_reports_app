import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kpi_reports',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migrations...\n');
    
    // Get all migration files sorted by name
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      const migrationName = file;
      
      // Check if migration already executed (skip for first migration that creates the table)
      if (file !== '001_create_migrations_table.sql') {
        const result = await client.query(
          'SELECT id FROM migrations WHERE name = $1',
          [migrationName]
        ).catch(() => ({ rows: [] })); // Table might not exist yet
        
        if (result.rows.length > 0) {
          console.log(`⏭️  Skipping: ${migrationName} (already executed)`);
          continue;
        }
      }
      
      // Read and execute migration
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`▶️  Running: ${migrationName}`);
      await client.query(sql);
      
      // Record migration (skip for first one, it creates the table)
      if (file !== '001_create_migrations_table.sql') {
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [migrationName]
        );
      } else {
        // For the first migration, insert itself after table is created
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [migrationName]
        );
      }
      
      console.log(`✅ Completed: ${migrationName}\n`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
