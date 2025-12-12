-- Migration: Add UL PDCP UE Throughput with CA column
-- Description: Add missing Average UL PDCP UE Throughput with CA (Mbps) KPI metric

ALTER TABLE lte_kpi_data 
ADD COLUMN IF NOT EXISTS avg_ul_pdcp_ue_throughput_ca_mbps NUMERIC(10, 2);

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('007_add_ul_throughput_ca', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
