-- Migration: Add RRC Connected Users Metrics to NR KPI Data Table
-- Description: Add peak and average RRC connected users metrics
-- Date: 2025-12-19

ALTER TABLE nr_kpi_data 
ADD COLUMN IF NOT EXISTS peak_rrc_connected_users DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_rrc_connected_users DECIMAL(10,2);

-- Add comments to new columns
COMMENT ON COLUMN nr_kpi_data.peak_rrc_connected_users IS 'Peak number of NR EN-DC RRC Connected Users (sum of PMRRCCONNLEVELMAXENDC per hour/date/freq_band)';
COMMENT ON COLUMN nr_kpi_data.avg_rrc_connected_users IS 'Average NR EN-DC RRC Connected Users (sum of Average NR EN-DC RRC Connected Users per hour/date/freq_band)';
