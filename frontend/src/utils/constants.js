// API Base URL - empty for production (uses relative URLs through Nginx proxy)
// For local development, set REACT_APP_API_URL=http://localhost:5000
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
  gsm: {
    upload: `${API_BASE_URL}/api/gsm/upload`,
    data: `${API_BASE_URL}/api/gsm/data`,
    dateRange: `${API_BASE_URL}/api/gsm/date-range`,
    dailyStats: `${API_BASE_URL}/api/gsm/daily-stats`,
  },
  lte: {
    upload: `${API_BASE_URL}/api/lte/upload`,
    data: `${API_BASE_URL}/api/lte/data`,
    dateRange: `${API_BASE_URL}/api/lte/date-range`,
    sites: `${API_BASE_URL}/api/lte/sites`,
    aggregatedStats: `${API_BASE_URL}/api/lte/aggregated-stats`,
  },
  lteFrequency: {
    upload: `${API_BASE_URL}/api/lte-frequency/upload`,
    data: `${API_BASE_URL}/api/lte-frequency/data`,
    dateRange: `${API_BASE_URL}/api/lte-frequency/date-range`,
    frequencies: `${API_BASE_URL}/api/lte-frequency/frequencies`,
    aggregatedStats: `${API_BASE_URL}/api/lte-frequency/aggregated-stats`,
  },
  lteKpi: {
    upload: `${API_BASE_URL}/api/lte-kpi/upload`,
    data: `${API_BASE_URL}/api/lte-kpi/data`,
  },
  nr: {
    upload: `${API_BASE_URL}/api/nr/upload`,
    data: `${API_BASE_URL}/api/nr/data`,
  },
  nrCell: {
    upload: `${API_BASE_URL}/api/nr-cell/upload`,
    kpiHourly: `${API_BASE_URL}/api/nr-cell/kpi-hourly`,
    trafficWeekly: `${API_BASE_URL}/api/nr-cell/traffic-weekly`,
  },
  endcLte: {
    upload: `${API_BASE_URL}/api/endc-lte/upload`,
    traffic: `${API_BASE_URL}/api/endc-lte/traffic`,
    trafficByDate: `${API_BASE_URL}/api/endc-lte/traffic-by-date`,
  },
};

// Chart Configuration
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// File Upload Settings
export const FILE_UPLOAD = {
  acceptedFormats: '.csv,.xlsx,.xls',
  maxSize: 50 * 1024 * 1024, // 50MB (for large NR raw data files)
};

// Network Types
export const NETWORK_TYPES = {
  GSM: 'gsm',
  LTE: 'lte',
  LTE_FREQUENCY: 'lteFrequency',
  NR: 'nr',
};
