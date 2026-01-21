-- Migration: Create NR Site Traffic Weekly Table
-- Description: Stores weekly aggregated 5G traffic volumes by site and frequency band
-- Date: 2026-01-20

CREATE TABLE IF NOT EXISTS nr_site_traffic_weekly (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  site_name VARCHAR(100) NOT NULL,
  freq_band VARCHAR(20) NOT NULL,
  
  -- Traffic Volumes
  user_data_traffic_volume_dl_gb DECIMAL(12,3),
  user_data_traffic_volume_ul_gb DECIMAL(12,3),
  total_traffic_volume_gb DECIMAL(12,3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no duplicate entries for same week/site/band
  UNIQUE(week_start_date, site_name, freq_band)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_nr_site_traffic_week ON nr_site_traffic_weekly(week_start_date);
CREATE INDEX IF NOT EXISTS idx_nr_site_traffic_site ON nr_site_traffic_weekly(site_name);
CREATE INDEX IF NOT EXISTS idx_nr_site_traffic_band ON nr_site_traffic_weekly(freq_band);
CREATE INDEX IF NOT EXISTS idx_nr_site_traffic_week_site ON nr_site_traffic_weekly(week_start_date, site_name);
CREATE INDEX IF NOT EXISTS idx_nr_site_traffic_year_week ON nr_site_traffic_weekly(year, week_number);

-- Add comments
COMMENT ON TABLE nr_site_traffic_weekly IS 'Weekly aggregated 5G traffic volumes by site and frequency band';
COMMENT ON COLUMN nr_site_traffic_weekly.week_start_date IS 'Start date of the week (Monday)';
COMMENT ON COLUMN nr_site_traffic_weekly.week_number IS 'ISO week number (1-53)';
COMMENT ON COLUMN nr_site_traffic_weekly.year IS 'Year of the week';
COMMENT ON COLUMN nr_site_traffic_weekly.site_name IS 'Site name (e.g., abria, aeroporti)';
COMMENT ON COLUMN nr_site_traffic_weekly.freq_band IS 'Frequency band (e.g., 900MHz, 3500MHz)';
COMMENT ON COLUMN nr_site_traffic_weekly.user_data_traffic_volume_dl_gb IS '5G User Data Traffic Volume on Downlink for the week (GB)';
COMMENT ON COLUMN nr_site_traffic_weekly.user_data_traffic_volume_ul_gb IS '5G User Data Traffic Volume on Uplink for the week (GB)';
COMMENT ON COLUMN nr_site_traffic_weekly.total_traffic_volume_gb IS 'Total traffic volume (DL + UL) for the week (GB)';

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('011_create_nr_site_traffic_weekly', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
