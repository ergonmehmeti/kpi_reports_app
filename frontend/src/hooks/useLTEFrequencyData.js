import { useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Custom hook for managing LTE Frequency data
 */
export const useLTEFrequencyData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.lteFrequency.data}?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      console.error('Error fetching LTE frequency data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
  };
};
