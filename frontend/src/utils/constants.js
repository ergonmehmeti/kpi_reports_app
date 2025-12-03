// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  },
  nr: {
    upload: `${API_BASE_URL}/api/nr/upload`,
    data: `${API_BASE_URL}/api/nr/data`,
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
  maxSize: 10 * 1024 * 1024, // 10MB
};

// Network Types
export const NETWORK_TYPES = {
  GSM: 'gsm',
  LTE: 'lte',
  NR: 'nr',
};
