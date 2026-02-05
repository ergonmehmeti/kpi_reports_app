import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get auth header with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Custom hook for fetching NR weekly traffic data (TOP Sites)
 */
export const useNRWeeklyTrafficData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      return;
    }

    console.log('🔍 Fetching NR Weekly Traffic Data:', { startDate, endDate });

    setLoading(true);
    setError(null);

    try {
      const params = { startDate, endDate };
      const response = await axios.get(API_ENDPOINTS.nrCell.trafficWeekly, { 
        params,
        headers: getAuthHeaders()
      });

      console.log('📊 NR Weekly Traffic Response:', { 
        count: response.data.data?.length,
        firstRecord: response.data.data?.[0]
      });

      setData(response.data.data || []);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error fetching NR weekly traffic data:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};
