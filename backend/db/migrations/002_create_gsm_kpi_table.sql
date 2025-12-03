-- GSM KPI Table
-- Stores hourly KPI data from GSM network reports

CREATE TABLE IF NOT EXISTS gsm_kpi (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    
    -- KPI Columns
    cell_availability DECIMAL(6,2),
    sdcch_congestion DECIMAL(6,2),
    sdcch_drop_rate DECIMAL(6,2),
    tch_traffic_volume DECIMAL(12,2),
    tch_assignment_success_rate DECIMAL(6,2),
    subscriber_tch_congestion DECIMAL(6,2),
    call_drop_rate DECIMAL(6,2),
    call_minutes_per_drop DECIMAL(8,2),
    handover_success_rate DECIMAL(6,2),
    handover_drop_rate DECIMAL(6,2),
    good_voice_qual_ratio_ul DECIMAL(6,2),
    
    -- Metadata
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate entries for same date/hour
    UNIQUE(date, hour)
);

-- Index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_gsm_kpi_date ON gsm_kpi(date);
CREATE INDEX IF NOT EXISTS idx_gsm_kpi_date_hour ON gsm_kpi(date, hour);
