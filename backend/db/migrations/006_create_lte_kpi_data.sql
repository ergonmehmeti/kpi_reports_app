-- Migration: Create LTE KPI Data Table
-- Description: Stores hourly LTE network KPI metrics (33 metrics per hour)

CREATE TABLE IF NOT EXISTS lte_kpi_data (
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMP NOT NULL,
  
  -- Availability KPIs
  cell_availability_pct NUMERIC(5, 2),
  cell_unavailability_fault_pct NUMERIC(5, 2),
  cell_unavailability_operation_pct NUMERIC(5, 2),
  
  -- Connection Success KPIs
  rrc_connection_success_pct NUMERIC(5, 2),
  s1_connection_success_pct NUMERIC(5, 2),
  erab_only_establishment_success_pct NUMERIC(5, 2),
  initial_erab_establishment_success_pct NUMERIC(5, 2),
  
  -- E-RAB Drop KPIs
  erab_drop_ratio_overall_pct NUMERIC(5, 2),
  erab_drop_mme_pct NUMERIC(5, 2),
  erab_drop_enb_pct NUMERIC(5, 2),
  erab_drops_per_hour_overall NUMERIC(10, 2),
  erab_drops_per_hour_mme NUMERIC(10, 2),
  erab_drops_per_hour_enb NUMERIC(10, 2),
  
  -- Handover KPIs
  handover_success_ratio_pct NUMERIC(5, 2),
  handover_execution_success_pct NUMERIC(5, 2),
  handover_preparation_success_pct NUMERIC(5, 2),
  
  -- Downlink PDCP Throughput KPIs
  avg_dl_pdcp_ue_throughput_overall_mbps NUMERIC(10, 2),
  avg_dl_pdcp_ue_throughput_ca_mbps NUMERIC(10, 2),
  dl_pdcp_traffic_volume_ca_gb NUMERIC(10, 2),
  dl_pdcp_traffic_volume_without_ca_gb NUMERIC(10, 2),
  dl_pdcp_traffic_volume_overall_gb NUMERIC(10, 2),
  
  -- Uplink PDCP Throughput KPIs
  avg_ul_pdcp_ue_throughput_overall_mbps NUMERIC(10, 2),
  ul_pdcp_traffic_volume_overall_gb NUMERIC(10, 2),
  ul_pdcp_traffic_volume_ca_gb NUMERIC(10, 2),
  
  -- Connected Users KPIs
  connected_lte_users_avg INTEGER,
  connected_lte_users_max INTEGER,
  
  -- MAC Layer KPIs
  avg_dl_mac_cell_throughput_mbps NUMERIC(10, 2),
  dl_mac_traffic_volume_gb NUMERIC(10, 2),
  avg_ul_mac_cell_throughput_mbps NUMERIC(10, 2),
  ul_mac_traffic_volume_gb NUMERIC(10, 2),
  
  -- Latency and Loss KPIs
  downlink_latency_ms NUMERIC(10, 2),
  uplink_packet_loss_pct NUMERIC(5, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique datetime entries
  UNIQUE(datetime)
);

-- Index for faster datetime range queries
CREATE INDEX IF NOT EXISTS idx_lte_kpi_datetime ON lte_kpi_data(datetime);

-- Insert migration record
INSERT INTO migrations (name, executed_at) 
VALUES ('006_create_lte_kpi_data', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
