import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Login response with token and user
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

/**
 * Get auth header with token
 * @returns {object} Headers with Authorization
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload CSV file for specific network type
 * @param {string} type - Network type (gsm, lte, nr)
 * @param {File} file - File to upload
 * @returns {Promise} Upload response
 */
export const uploadCSV = async (type, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = API_ENDPOINTS[type]?.upload;
  console.log('🔴 API uploadCSV called - type:', type, 'endpoint:', endpoint);
  if (!endpoint) {
    throw new Error(`Invalid network type: ${type}`);
  }

  const response = await axios.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders(),
    },
  });
  console.log('🟣 API response:', response.data);

  return response.data;
};

/**
 * Get KPI data for specific network type
 * @param {string} type - Network type (gsm, lte, nr)
 * @param {object} params - Query parameters (startDate, endDate)
 * @returns {Promise} KPI data
 */
export const getKPIData = async (type, params = {}) => {
  const endpoint = API_ENDPOINTS[type]?.data;
  if (!endpoint) {
    throw new Error(`Invalid network type: ${type}`);
  }

  const response = await axios.get(endpoint, { params });
  return response.data;
};

/**
 * Get date range for GSM data
 * @returns {Promise} Date range information
 */
export const getGSMDateRange = async () => {
  const response = await axios.get(API_ENDPOINTS.gsm.dateRange);
  return response.data;
};

/**
 * Get daily statistics for GSM
 * @param {object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Daily stats
 */
export const getGSMDailyStats = async (params = {}) => {
  const response = await axios.get(API_ENDPOINTS.gsm.dailyStats, { params });
  return response.data;
};
