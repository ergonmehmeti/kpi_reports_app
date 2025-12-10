-- Migration: Update LTE Frequency table from daily to hourly data
-- Date: 2025-12-10
-- WARNING: This migration will DELETE all existing frequency data
-- because old data has daily format and new data has hourly format

-- Step 1: Delete all existing data (incompatible format)
TRUNCATE TABLE lte_frequency_data;

-- Step 2: Drop old unique constraint
ALTER TABLE lte_frequency_data DROP CONSTRAINT IF EXISTS lte_frequency_data_date_earfcndl_key;

-- Step 3: Add datetime column
ALTER TABLE lte_frequency_data ADD COLUMN datetime TIMESTAMP;

-- Step 4: Drop old date column
ALTER TABLE lte_frequency_data DROP COLUMN date;

-- Step 5: Make datetime NOT NULL
ALTER TABLE lte_frequency_data ALTER COLUMN datetime SET NOT NULL;

-- Step 6: Add new unique constraint on datetime and earfcndl
ALTER TABLE lte_frequency_data ADD CONSTRAINT lte_frequency_data_datetime_earfcndl_key UNIQUE (datetime, earfcndl);

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lte_frequency_datetime ON lte_frequency_data(datetime);
CREATE INDEX IF NOT EXISTS idx_lte_frequency_earfcndl ON lte_frequency_data(earfcndl);
