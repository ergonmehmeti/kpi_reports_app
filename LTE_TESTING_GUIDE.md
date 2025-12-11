# LTE Site Data Import - Testing Guide

## ✅ Implementation Complete

### Backend Files Created:
- ✅ `backend/services/lteService.js` - Database operations
- ✅ `backend/controllers/lteController.js` - CSV import logic
- ✅ `backend/routes/lte.js` - API routes
- ✅ `backend/db/migrations/003_create_lte_daily_site_traffic_table.sql`

### Frontend Updates:
- ✅ `frontend/src/utils/constants.js` - Added LTE endpoints
- ✅ `frontend/src/components/layout/SideNav.js` - Enabled "Import LTE Site Data CSV" button

### API Endpoints Created:
- `POST /api/lte/upload` - Import CSV
- `GET /api/lte/data` - Get traffic data (with filters)
- `GET /api/lte/date-range` - Get date range
- `GET /api/lte/sites` - Get site list
- `GET /api/lte/aggregated-stats` - Get aggregated stats

---

## 🧪 Testing Steps

### 1. Run Migration (Create Table)
```bash
# Local
cd backend
node db/migrate.js

# Should output:
# ✅ Completed: 003_create_lte_daily_site_traffic_table.sql
```

### 2. Start Backend
```bash
cd backend
npm start
# or
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

### 4. Test Import

1. Open app in browser: http://localhost:3000
2. Click hamburger menu (☰)
3. Click **LTE** to expand
4. Click **Import LTE Site Data CSV**
5. Select `lte_site_data-sample.csv`
6. Wait for success message

**Expected Result:**
```
Success! 19139 inserted, 0 updated
```

---

## 🔍 Verify Data in Database

### Check Records
```bash
# Local
psql -d kpi_reports -c "SELECT COUNT(*) FROM lte_daily_site_traffic;"

# Should show: 19139 rows
```

### View Sample Data
```bash
psql -d kpi_reports -c "SELECT * FROM lte_daily_site_traffic WHERE site_name = 'abria' ORDER BY date DESC LIMIT 5;"
```

### Check Date Range
```bash
psql -d kpi_reports -c "SELECT MIN(date), MAX(date), COUNT(DISTINCT site_name) FROM lte_daily_site_traffic;"

# Expected:
# min: 2025-11-03
# max: 2025-12-07
# sites: 549
```

---

## 🌐 API Testing (with curl/Postman)

### Test Upload
```bash
curl -X POST http://localhost:5000/api/lte/upload \
  -F "file=@lte_site_data-sample.csv"
```

### Get All Data (first 10)
```bash
curl "http://localhost:5000/api/lte/data"
```

### Get Data for Specific Site
```bash
curl "http://localhost:5000/api/lte/data?siteName=abria"
```

### Get Data for Date Range
```bash
curl "http://localhost:5000/api/lte/data?startDate=2025-11-03&endDate=2025-11-10"
```

### Get Multiple Sites
```bash
curl "http://localhost:5000/api/lte/data?siteNames=abria,aeroporti,xhamlliku"
```

### Get Site List
```bash
curl "http://localhost:5000/api/lte/sites"
```

### Get Weekly Aggregation
```bash
curl "http://localhost:5000/api/lte/aggregated-stats?groupBy=week&startDate=2025-11-01&endDate=2025-11-30"
```

### Get Monthly Stats for One Site
```bash
curl "http://localhost:5000/api/lte/aggregated-stats?groupBy=month&siteName=abria"
```

---

## 🚀 Deploy to Production Server

### 1. Push to GitHub
```bash
git add -A
git commit -m "Add LTE site traffic import feature"
git push
```

### 2. Pull on Server
```bash
ssh ergon@10.11.254.59
cd /var/www/kpi-reports
git pull
```

### 3. Run Migration
```bash
cd backend
node db/migrate.js
```

### 4. Restart Backend & Rebuild Frontend
```bash
cd /var/www/kpi-reports/frontend && npm run build && pm2 restart kpi-reports-api
```

### 5. Test on Server
- Visit: http://10.11.254.59
- Import LTE CSV via UI
- Verify in database

---

## 📊 Next Steps (Future)

- [ ] Create LTE Reports page (similar to GSM Reports)
- [ ] Add charts for traffic visualization
- [ ] Add site comparison feature
- [ ] Implement LTE KPI import (hourly data)
- [ ] Implement LTE Frequency Data import

---

## ⚠️ Troubleshooting

### Import fails with "Invalid date format"
- Check CSV has dates in MM/DD/YYYY format
- First row should be: `Date,ERBS Name,Total LTE Traffic Volume (GB),4G UL PDCP Total Traffic Volume (GB),4G DL PDCP Total Traffic Volume (GB)`

### Backend error "relation does not exist"
- Run migration: `node db/migrate.js`

### Frontend button still shows "Coming Soon"
- Clear browser cache
- Restart frontend dev server
- Check SideNav.js was updated correctly

### Data not showing after import
- Check backend logs: `pm2 logs kpi-reports-api`
- Verify database: `psql -d kpi_reports -c "SELECT COUNT(*) FROM lte_daily_site_traffic;"`
