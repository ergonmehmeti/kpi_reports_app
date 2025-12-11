-- Migration: Create lte_frequency_data table
-- Description: Stores daily LTE traffic volume per frequency channel (earfcndl)

CREATE TABLE IF NOT EXISTS lte_frequency_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  earfcndl INTEGER NOT NULL,
  total_traffic_gb NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, earfcndl)
);

CREATE INDEX idx_lte_frequency_date ON lte_frequency_data(date);
CREATE INDEX idx_lte_frequency_earfcndl ON lte_frequency_data(earfcndl);
CREATE INDEX idx_lte_frequency_date_earfcndl ON lte_frequency_data(date, earfcndl);

COMMENT ON TABLE lte_frequency_data IS 'Daily LTE traffic volume per frequency channel';
COMMENT ON COLUMN lte_frequency_data.date IS 'Date of the traffic data';
COMMENT ON COLUMN lte_frequency_data.earfcndl IS 'E-UTRA Absolute Radio Frequency Channel Number Downlink';
COMMENT ON COLUMN lte_frequency_data.total_traffic_gb IS 'Total LTE traffic volume in GB for this frequency';
