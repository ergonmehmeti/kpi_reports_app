import { useState, useCallback } from 'react';

/**
 * Custom hook for fetching LTE KPI data
 */
export const useLTEKPIData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/lte-kpi/data?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch KPI data');
      }

      const result = await response.json();
      setData(result.data || []);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching LTE KPI data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};
