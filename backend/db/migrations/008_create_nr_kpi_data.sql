-- Migration: Create NR KPI Data Table
-- Description: Stores hourly 5G NR KPI metrics aggregated by frequency band
-- Date: 2025-12-18

CREATE TABLE IF NOT EXISTS nr_kpi_data (
  id SERIAL PRIMARY KEY,
  date_id DATE NOT NULL,
  hour_id INTEGER NOT NULL CHECK (hour_id >= 0 AND hour_id <= 23),
  freq_band VARCHAR(20) NOT NULL,
  
  -- Accessibility KPI
  endc_setup_success_rate DECIMAL(5,2),
  
  -- Mobility KPIs
  endc_intra_pscell_change_success_rate DECIMAL(5,2),
  endc_inter_pscell_change_success_rate DECIMAL(5,2),
  
  -- Retainability KPIs
  scg_retainability_endc_connectivity DECIMAL(5,2),
  scg_retainability_active DECIMAL(5,2),
  scg_retainability_overall DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no duplicate entries for same date/hour/band
  UNIQUE(date_id, hour_id, freq_band)
);

-- Create index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_nr_kpi_date ON nr_kpi_data(date_id, hour_id);

-- Create index for frequency band filtering
CREATE INDEX IF NOT EXISTS idx_nr_kpi_freq_band ON nr_kpi_data(freq_band);

-- Add comment to table
COMMENT ON TABLE nr_kpi_data IS 'Hourly 5G NR KPI metrics aggregated by frequency band (900MHz, 3500MHz)';
COMMENT ON COLUMN nr_kpi_data.endc_setup_success_rate IS 'EN-DC Setup Success Rate captured in gNodeB (%)';
COMMENT ON COLUMN nr_kpi_data.endc_intra_pscell_change_success_rate IS 'EN-DC Intra-sgNodeB PSCell Change Success Rate Captured in gNodeB (%)';
COMMENT ON COLUMN nr_kpi_data.endc_inter_pscell_change_success_rate IS 'EN-DC Inter-sgNodeB PSCell Change Success Rate Captured in gNodeB (%)';
COMMENT ON COLUMN nr_kpi_data.scg_retainability_endc_connectivity IS 'SCG Active Radio Resource Retainability considering EN-DC connectivity, Captured in gNodeB (%)';
COMMENT ON COLUMN nr_kpi_data.scg_retainability_active IS 'SCG Active Radio Resource Retainability, Captured in gNodeB (%)';
COMMENT ON COLUMN nr_kpi_data.scg_retainability_overall IS 'SCG Radio Resource Retainability Captured in gNodeB (%)';
