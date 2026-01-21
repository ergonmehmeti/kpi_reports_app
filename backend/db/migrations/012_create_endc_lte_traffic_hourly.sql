-- Migration: Create EN-DC LTE Traffic Hourly Table
-- Description: Stores EN-DC traffic volumes on LTE anchor cells (hourly)
-- Date: 2026-01-20

CREATE TABLE IF NOT EXISTS endc_lte_traffic_hourly (
  id SERIAL PRIMARY KEY,
  date_id DATE NOT NULL,
  hour_id INTEGER NOT NULL CHECK (hour_id >= 0 AND hour_id <= 23),
  lte_cell_name VARCHAR(100) NOT NULL,
  site_name VARCHAR(100),
  freq_band VARCHAR(20),
  
  -- EN-DC Traffic Volumes (from PMFLEXPDCPVOLDLDRB[Endc2To99] and PMFLEXPDCPVOLULDRB[Endc2To99])
  endc_traffic_volume_dl_gb DECIMAL(12,3),
  endc_traffic_volume_ul_gb DECIMAL(12,3),
  endc_total_traffic_volume_gb DECIMAL(12,3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no duplicate entries for same date/hour/cell
  UNIQUE(date_id, hour_id, lte_cell_name)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_date ON endc_lte_traffic_hourly(date_id, hour_id);
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_cell ON endc_lte_traffic_hourly(lte_cell_name);
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_site ON endc_lte_traffic_hourly(site_name);
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_band ON endc_lte_traffic_hourly(freq_band);
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_date_site ON endc_lte_traffic_hourly(date_id, site_name);

-- Add comments
COMMENT ON TABLE endc_lte_traffic_hourly IS 'Hourly EN-DC traffic volumes on LTE anchor cells';
COMMENT ON COLUMN endc_lte_traffic_hourly.lte_cell_name IS 'LTE cell name serving as EN-DC anchor (e.g., abria_L18_1)';
COMMENT ON COLUMN endc_lte_traffic_hourly.site_name IS 'Site name extracted from cell name (e.g., abria)';
COMMENT ON COLUMN endc_lte_traffic_hourly.freq_band IS 'LTE frequency band (e.g., 1800MHz, 2600MHz)';
COMMENT ON COLUMN endc_lte_traffic_hourly.endc_traffic_volume_dl_gb IS 'EN-DC User Data Traffic Volume on LTE Downlink (GB) - calculated from PMFLEXPDCPVOLDLDRB[Endc2To99]';
COMMENT ON COLUMN endc_lte_traffic_hourly.endc_traffic_volume_ul_gb IS 'EN-DC User Data Traffic Volume on LTE Uplink (GB) - calculated from PMFLEXPDCPVOLULDRB[Endc2To99]';
COMMENT ON COLUMN endc_lte_traffic_hourly.endc_total_traffic_volume_gb IS 'Total EN-DC traffic volume (DL + UL) on LTE (GB)';

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('012_create_endc_lte_traffic_hourly', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
