-- =====================================================
-- LTE DAILY SITE TRAFFIC TABLE
-- Stores daily traffic data per LTE site
-- =====================================================

CREATE TABLE IF NOT EXISTS lte_daily_site_traffic (
    id SERIAL PRIMARY KEY,
    
    -- Date & Site
    date DATE NOT NULL,
    site_name VARCHAR(100) NOT NULL,
    
    -- Traffic Metrics (in GB)
    total_traffic_gb NUMERIC(10,2),              -- Total LTE Traffic Volume (GB)
    ul_traffic_gb NUMERIC(10,2),                 -- 4G UL PDCP Total Traffic Volume (GB)
    dl_traffic_gb NUMERIC(10,2),                 -- 4G DL PDCP Total Traffic Volume (GB)
    
    -- Metadata
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(date, site_name)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_lte_traffic_date ON lte_daily_site_traffic(date);
CREATE INDEX IF NOT EXISTS idx_lte_traffic_site ON lte_daily_site_traffic(site_name);
CREATE INDEX IF NOT EXISTS idx_lte_traffic_date_site ON lte_daily_site_traffic(date, site_name);

-- Comments for documentation
COMMENT ON TABLE lte_daily_site_traffic IS 'Daily traffic data per LTE site';
COMMENT ON COLUMN lte_daily_site_traffic.site_name IS 'LTE site identifier (ERBS name)';
COMMENT ON COLUMN lte_daily_site_traffic.total_traffic_gb IS 'Total traffic volume in GB';
COMMENT ON COLUMN lte_daily_site_traffic.ul_traffic_gb IS 'Uplink (UL) PDCP traffic in GB';
COMMENT ON COLUMN lte_daily_site_traffic.dl_traffic_gb IS 'Downlink (DL) PDCP traffic in GB';
