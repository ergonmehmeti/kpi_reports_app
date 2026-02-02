-- Migration: Simplify EN-DC LTE Traffic Table to Network-Wide Hourly Totals
-- Description: Remove cell/site/band granularity - store only hourly network totals
-- Date: 2026-02-02

-- Drop the existing table (WARNING: This will delete all data)
DROP TABLE IF EXISTS endc_lte_traffic_hourly CASCADE;

-- Create simplified table with network-wide hourly aggregation
CREATE TABLE IF NOT EXISTS endc_lte_traffic_hourly (
  id SERIAL PRIMARY KEY,
  date_id DATE NOT NULL,
  hour_id INTEGER NOT NULL CHECK (hour_id >= 0 AND hour_id <= 23),
  
  -- EN-DC Traffic Volume (network-wide total)
  -- Formula: 8*(PMFLEXPDCPVOLDLDRB[Endc2To99] + PMFLEXPDCPVOLULDRB[Endc2To99])/(1000*1000)
  endc_total_traffic_volume_gb DECIMAL(12,3),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no duplicate entries for same date/hour (one record per hour for entire network)
  UNIQUE(date_id, hour_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_date ON endc_lte_traffic_hourly(date_id, hour_id);
CREATE INDEX IF NOT EXISTS idx_endc_lte_traffic_date_only ON endc_lte_traffic_hourly(date_id);

-- Add comments
COMMENT ON TABLE endc_lte_traffic_hourly IS 'Hourly EN-DC traffic volumes aggregated network-wide (all cells combined)';
COMMENT ON COLUMN endc_lte_traffic_hourly.date_id IS 'Date of the traffic data';
COMMENT ON COLUMN endc_lte_traffic_hourly.hour_id IS 'Hour of day (0-23)';
COMMENT ON COLUMN endc_lte_traffic_hourly.endc_total_traffic_volume_gb IS 'Total EN-DC User Data Traffic Volume on LTE for entire network (GB) - Formula: 8*(PMFLEXPDCPVOLDLDRB[Endc2To99] + PMFLEXPDCPVOLULDRB[Endc2To99])/(1000*1000)';

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('013_simplify_endc_lte_traffic_to_hourly_totals', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
