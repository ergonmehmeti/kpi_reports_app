import { useState, useCallback } from 'react';
import { getKPIData, getGSMDailyStats } from '../services/api';
import { formatGSMData } from '../utils/gsmDataFormatters';

/**
 * Custom hook for fetching and managing GSM KPI data
 * @returns {Object} Data state, loading state, error state, and fetch function
 */
export const useGSMData = () => {
  const [data, setData] = useState({
    successRate: [],
    congestion: [],
    trafficVolume: [],
    cellAvailability: [],
    sdcchCongestion: [],
    sdcchDropRate: [],
    callDropRate: [],
    callMinutesPerDrop: [],
    handoverSuccess: [],
    handoverDropRate: [],
    voiceQuality: [],
    dailyTrafficVolume: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { startDate, endDate };

      console.log('Fetching GSM data with params:', params);

      // Fetch hourly data for line charts
      const hourlyResponse = await getKPIData('gsm', params);
      console.log('Hourly response:', hourlyResponse);
      
      // Fetch daily stats for bar chart
      const dailyResponse = await getGSMDailyStats(params);
      console.log('Daily response:', dailyResponse);
      
      if (hourlyResponse.data && hourlyResponse.data.length > 0) {
        const formattedData = formatGSMData(hourlyResponse.data, dailyResponse.data);
        setData(formattedData);
      } else {
        setError('No data available. Please import GSM CSV data first.');
      }
    } catch (err) {
      console.error('Error fetching GSM data:', err);
      setError('Failed to load data. Please ensure backend is running and data is imported.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
  };
};
