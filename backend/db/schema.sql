-- KPI Reports App - Database Schema
-- This file represents the current full schema (for reference)
-- Use migrations for actual database changes

-- =====================================================
-- MIGRATIONS TABLE (tracks executed migrations)
-- =====================================================
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GSM KPI TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gsm_kpi (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    
    -- KPI Columns (from CSV)
    cell_availability DECIMAL(6,2),              -- Cell Availability %
    sdcch_congestion DECIMAL(6,2),               -- Signaling (SDCCH) Congestion %
    sdcch_drop_rate DECIMAL(6,2),                -- Signaling (SDCCH) Drop Rate %
    tch_traffic_volume DECIMAL(12,2),            -- Traffic Volume on TCH (Erlang)
    tch_assignment_success_rate DECIMAL(6,2),    -- TCH Assignment Success Rate %
    subscriber_tch_congestion DECIMAL(6,2),      -- Subscriber Perceived TCH Congestion %
    call_drop_rate DECIMAL(6,2),                 -- Call Drop Rate %
    call_minutes_per_drop DECIMAL(8,2),          -- Call Minutes Per Drop
    handover_success_rate DECIMAL(6,2),          -- Handover Success Rate %
    handover_drop_rate DECIMAL(6,2),             -- Handover Drop Rate %
    good_voice_qual_ratio_ul DECIMAL(6,2),       -- Good Voice Quality Ratio UL %
    
    -- Metadata
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(date, hour)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gsm_kpi_date ON gsm_kpi(date);
CREATE INDEX IF NOT EXISTS idx_gsm_kpi_date_hour ON gsm_kpi(date, hour);

-- =====================================================
-- LTE DAILY SITE TRAFFIC TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lte_daily_site_traffic (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    site_name VARCHAR(100) NOT NULL,
    total_traffic_gb NUMERIC(10,2),
    ul_traffic_gb NUMERIC(10,2),
    dl_traffic_gb NUMERIC(10,2),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, site_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lte_traffic_date ON lte_daily_site_traffic(date);
CREATE INDEX IF NOT EXISTS idx_lte_traffic_site ON lte_daily_site_traffic(site_name);
CREATE INDEX IF NOT EXISTS idx_lte_traffic_date_site ON lte_daily_site_traffic(date, site_name);

-- =====================================================
-- FUTURE: LTE KPI TABLE (placeholder)
-- =====================================================
-- Will be added when hourly KPIs are defined

-- =====================================================
-- FUTURE: LTE FREQUENCY DATA TABLE (placeholder)
-- =====================================================
-- Will be added when frequency data structure is defined

-- =====================================================
-- FUTURE: NR (5G) KPI TABLE (placeholder)
-- =====================================================
-- Will be added when KPIs are defined
