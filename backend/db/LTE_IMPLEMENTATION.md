# LTE Daily Site Traffic - Implementation Guide

## Database Setup

### Run Migration (Local)
```bash
cd backend
node db/migrate.js
```

### Run Migration (Server)
```bash
cd /var/www/kpi-reports/backend
node db/migrate.js
```

### Verify Table Created
```bash
# Local
psql -d kpi_reports -c "\d lte_daily_site_traffic"

# Server
sudo -u postgres psql -d kpi_reports -c "\d lte_daily_site_traffic"
```

## Table Structure

**Table:** `lte_daily_site_traffic`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| date | DATE | Date of measurement |
| site_name | VARCHAR(100) | LTE site identifier (ERBS) |
| total_traffic_gb | NUMERIC(10,2) | Total traffic in GB |
| ul_traffic_gb | NUMERIC(10,2) | Uplink traffic in GB |
| dl_traffic_gb | NUMERIC(10,2) | Downlink traffic in GB |
| imported_at | TIMESTAMP | Import timestamp |

**Unique Constraint:** `(date, site_name)` - one record per site per day

**Indexes:**
- `idx_lte_traffic_date` - on date
- `idx_lte_traffic_site` - on site_name
- `idx_lte_traffic_date_site` - on (date, site_name)

## Next Steps

1. ✅ Migration created
2. ⏳ Run migration to create table
3. ⏳ Create `lteService.js` (similar to `gsmService.js`)
4. ⏳ Create `lteController.js` for CSV import
5. ⏳ Add routes in `routes/lte.js`
6. ⏳ Update frontend SideNav to enable import button
7. ⏳ Create LTE Reports page

## Query Examples

```sql
-- Daily traffic for a specific site
SELECT * FROM lte_daily_site_traffic 
WHERE site_name = 'abria' 
AND date >= '2025-11-01' AND date < '2025-12-01'
ORDER BY date;

-- Weekly aggregation
SELECT 
    site_name,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(WEEK FROM date) as week,
    SUM(total_traffic_gb) as weekly_total_gb,
    AVG(total_traffic_gb) as daily_avg_gb
FROM lte_daily_site_traffic
WHERE date >= '2025-11-01'
GROUP BY site_name, year, week
ORDER BY site_name, year, week;

-- Monthly aggregation
SELECT 
    site_name,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(total_traffic_gb) as monthly_total_gb,
    COUNT(*) as days_with_data
FROM lte_daily_site_traffic
GROUP BY site_name, year, month
ORDER BY site_name, year, month;

-- Top 10 sites by traffic
SELECT 
    site_name,
    SUM(total_traffic_gb) as total_gb
FROM lte_daily_site_traffic
WHERE date >= '2025-11-01' AND date < '2025-12-01'
GROUP BY site_name
ORDER BY total_gb DESC
LIMIT 10;
```
