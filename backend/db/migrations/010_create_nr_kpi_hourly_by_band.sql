-- Migration: Create NR KPI Hourly by Band Table
-- Description: Stores calculated 5G NR KPIs aggregated by date/hour/frequency band
-- Date: 2026-01-20

CREATE TABLE IF NOT EXISTS nr_kpi_hourly_by_band (
  id SERIAL PRIMARY KEY,
  date_id DATE NOT NULL,
  hour_id INTEGER NOT NULL CHECK (hour_id >= 0 AND hour_id <= 23),
  freq_band VARCHAR(20) NOT NULL,
  
  -- Downlink KPIs
  avg_dl_mac_drb_throughput_mbps DECIMAL(10,2),
  normalized_avg_dl_mac_cell_throughput_traffic_mbps DECIMAL(10,2),
  normalized_dl_mac_cell_throughput_actual_pdsch_mbps DECIMAL(10,2),
  pdsch_slot_utilization_pct DECIMAL(6,2),
  dl_rbsym_utilization_pct DECIMAL(6,2),
  percentage_unrestricted_volume_dl_pct DECIMAL(6,2),
  user_data_traffic_volume_dl_gb DECIMAL(12,3),
  
  -- Uplink KPIs
  avg_ul_mac_ue_throughput_mbps DECIMAL(10,2),
  normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps DECIMAL(10,2),
  normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps DECIMAL(10,2),
  pusch_slot_utilization_pct DECIMAL(6,2),
  ul_rbsym_utilization_pct DECIMAL(6,2),
  percentage_unrestricted_volume_ul_pct DECIMAL(6,2),
  user_data_traffic_volume_ul_gb DECIMAL(12,3),
  
  -- Cell Performance KPIs
  partial_cell_availability_pct DECIMAL(6,2),
  ue_context_setup_success_rate_pct DECIMAL(6,2),
  random_access_success_rate_pct DECIMAL(6,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no duplicate entries for same date/hour/band
  UNIQUE(date_id, hour_id, freq_band)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_nr_kpi_hourly_date ON nr_kpi_hourly_by_band(date_id, hour_id);
CREATE INDEX IF NOT EXISTS idx_nr_kpi_hourly_band ON nr_kpi_hourly_by_band(freq_band);
CREATE INDEX IF NOT EXISTS idx_nr_kpi_hourly_date_band ON nr_kpi_hourly_by_band(date_id, freq_band);

-- Add comments
COMMENT ON TABLE nr_kpi_hourly_by_band IS 'Calculated 5G NR KPIs aggregated by date/hour/frequency band';
COMMENT ON COLUMN nr_kpi_hourly_by_band.avg_dl_mac_drb_throughput_mbps IS 'Average DL MAC DRB Throughput (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.normalized_avg_dl_mac_cell_throughput_traffic_mbps IS 'Normalized Average DL MAC Cell Throughput Considering Traffic (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.normalized_dl_mac_cell_throughput_actual_pdsch_mbps IS 'Normalized DL MAC Cell Throughput Captured in gNodeB Considering Actual PDSCH Slot Only (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.pdsch_slot_utilization_pct IS 'PDSCH Slot Utilization (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.dl_rbsym_utilization_pct IS 'DL RBSym Utilization (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.percentage_unrestricted_volume_dl_pct IS 'Percentage Unrestricted Volume DL (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.user_data_traffic_volume_dl_gb IS '5G User Data Traffic Volume on Downlink (GB)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.avg_ul_mac_ue_throughput_mbps IS 'Average UL MAC UE Throughput (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps IS 'Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Successful PUSCH Slot Only (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps IS 'Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Actual PUSCH Slot Only (Mbps)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.pusch_slot_utilization_pct IS 'PUSCH Slot Utilization (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.ul_rbsym_utilization_pct IS 'UL RBSym Utilization (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.percentage_unrestricted_volume_ul_pct IS 'Percentage Unrestricted Volume UL (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.user_data_traffic_volume_ul_gb IS '5G User Data Traffic Volume on Uplink (GB)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.partial_cell_availability_pct IS 'Partial Cell Availability for gNodeB Cell (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.ue_context_setup_success_rate_pct IS 'UE Context Setup Success Rate (%)';
COMMENT ON COLUMN nr_kpi_hourly_by_band.random_access_success_rate_pct IS 'Random Access Success Rate (%)';

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('010_create_nr_kpi_hourly_by_band', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
