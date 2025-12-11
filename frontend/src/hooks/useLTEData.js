import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Custom hook for fetching LTE traffic data
 */
export const useLTEData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (startDate, endDate, siteName = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { startDate, endDate };
      if (siteName) {
        params.siteName = siteName;
      }

      const response = await axios.get(API_ENDPOINTS.lte.data, { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error fetching LTE data:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAggregatedStats = useCallback(async (startDate, endDate, groupBy = 'day', siteName = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { startDate, endDate, groupBy };
      if (siteName) {
        params.siteName = siteName;
      }

      const response = await axios.get(API_ENDPOINTS.lte.aggregatedStats, { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error fetching LTE aggregated stats:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSites = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.lte.sites);
      return response.data.sites || [];
    } catch (err) {
      console.error('Error fetching LTE sites:', err);
      return [];
    }
  }, []);

  const fetchDateRange = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.lte.dateRange);
      return response.data;
    } catch (err) {
      console.error('Error fetching LTE date range:', err);
      return null;
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    fetchAggregatedStats,
    fetchSites,
    fetchDateRange
  };
};
