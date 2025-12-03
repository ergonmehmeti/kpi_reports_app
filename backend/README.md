# Backend - KPI Reports API

Backend API for the KPI Reports application built with Node.js, Express.js, and PostgreSQL.

## Features

- RESTful API built with Express.js
- PostgreSQL database integration
- CSV/Excel file upload and parsing using SheetJS (xlsx)
- CORS enabled for frontend integration
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=kpi_reports
DB_PASSWORD=your_password
DB_PORT=5432
```

4. Create the PostgreSQL database:
```bash
createdb kpi_reports
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check endpoint
- `POST /api/csv/upload` - Upload and parse CSV/Excel files
- `GET /api/csv/sample` - Get sample data format

## CSV/Excel File Upload

To upload a CSV or Excel file:

```bash
curl -X POST http://localhost:5000/api/csv/upload \
  -F "file=@your-file.csv"
```

Supported file formats: `.csv`, `.xlsx`, `.xls`

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables management
- **xlsx** - SheetJS library for CSV/Excel parsing
- **multer** - File upload middleware
- **nodemon** - Development auto-reload (dev dependency)
