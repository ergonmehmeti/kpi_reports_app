# KPI Reports App - Kosovo Telecom

A full-stack web application for managing and visualizing KPI (Key Performance Indicator) reports at Kosovo Telecom. The application allows users to upload CSV/Excel files and visualize the data through interactive charts.

## Project Structure

```
kpi_reports_app/
├── frontend/          # React application with charts
├── backend/           # Node.js/Express API server
└── README.md          # This file
```

## Technology Stack

### Frontend
- **React** - UI framework
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **SheetJS (xlsx)** - CSV/Excel file parsing
- **Multer** - File upload handling

## Features

- 📊 Interactive data visualization with line and bar charts
- 📁 CSV/Excel file upload and processing
- 🔄 Real-time data updates
- 🗄️ PostgreSQL database integration
- 🎨 Responsive design
- 🔌 RESTful API

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/ergonmehmeti/kpi_reports_app.git
cd kpi_reports_app
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

The backend will run on `http://localhost:5000`

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

4. **Setup Database**
```bash
# Create PostgreSQL database
createdb kpi_reports
```

## Usage

1. Start the backend server
2. Start the frontend application
3. Open your browser at `http://localhost:3000`
4. Upload a CSV or Excel file using the upload interface
5. View the visualized data in interactive charts

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check
- `POST /api/csv/upload` - Upload and process CSV/Excel files
- `GET /api/csv/sample` - Get sample data format

## File Format

The application accepts CSV and Excel files with the following structure:

```csv
name,KPI1,KPI2
January,400,240
February,300,139
March,200,980
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Runs with hot reload
```

## Documentation

For detailed documentation on each component:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## License

This project is part of Kosovo Telecom's internal tools.

## Author

Ergon Mehmeti

## Support

For issues and questions, please contact the development team.
