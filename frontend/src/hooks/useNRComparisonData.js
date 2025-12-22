import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * NR KPI definitions with database column names and display labels
 */
export const NR_KPI_OPTIONS = [
  { 
    id: 'endc_setup_success_rate', 
    label: 'EN-DC Setup Success Rate (%)', 
    column: 'endc_setup_success_rate',
    yAxisLabel: '%',
    category: 'Accessibility KPIs'
  },
  { 
    id: 'endc_inter_pscell_change_success_rate', 
    label: 'EN-DC Inter-sgNodeB PSCell Change Success Rate (%)', 
    column: 'endc_inter_pscell_change_success_rate',
    yAxisLabel: '%',
    category: 'Mobility KPIs'
  },
  { 
    id: 'scg_retainability_endc_connectivity', 
    label: 'SCG Retainability EN-DC Connectivity (%)', 
    column: 'scg_retainability_endc_connectivity',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'scg_retainability_active', 
    label: 'SCG Active Radio Resource Retainability (%)', 
    column: 'scg_retainability_active',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'scg_retainability_overall', 
    label: 'SCG Radio Resource Retainability (%)', 
    column: 'scg_retainability_overall',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'peak_rrc_connected_users', 
    label: 'Peak RRC Connected Users', 
    column: 'peak_rrc_connected_users',
    yAxisLabel: 'Users',
    category: 'User KPIs'
  },
  { 
    id: 'avg_rrc_connected_users', 
    label: 'Average RRC Connected Users', 
    column: 'avg_rrc_connected_users',
    yAxisLabel: 'Users',
    category: 'User KPIs'
  },
];

/**
 * Get auth header with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Format hourly data for comparison with normalized day labels
 */
const formatComparisonData = (data, columnName, freqBand, week1Label, week2Label, isWeek1) => {
  // Filter data for the specific frequency band
  const filteredData = data.filter(item => item.freq_band === freqBand);
  
  // Sort by date and hour
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(`${a.date_id}T${String(a.hour_id).padStart(2, '0')}:00:00`);
    const dateB = new Date(`${b.date_id}T${String(b.hour_id).padStart(2, '0')}:00:00`);
    return dateA - dateB;
  });

  const firstDate = sortedData.length > 0 ? new Date(sortedData[0].date_id) : null;
  
  return sortedData.map(item => {
    const itemDate = new Date(item.date_id);
    const dayDiff = Math.floor((itemDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = dayNames[dayDiff] || `Day${dayDiff}`;
    const hourStr = String(item.hour_id).padStart(2, '0');
    
    const result = {
      name: `${dayName} ${hourStr}:00`,
      dayIndex: dayDiff,
      hour: item.hour_id
    };
    
    // Add value with week label as key
    const value = parseFloat(item[columnName]);
    if (isWeek1) {
      result[week1Label] = isNaN(value) ? null : value;
    } else {
      result[week2Label] = isNaN(value) ? null : value;
    }
    
    return result;
  });
};

/**
 * Merge week1 and week2 data into single array for chart
 */
const mergeWeekData = (week1Data, week2Data, week1Label, week2Label) => {
  // Create a map for week1 data by name (day + hour)
  const dataMap = {};
  
  week1Data.forEach(item => {
    dataMap[item.name] = { ...item };
  });
  
  // Merge week2 data
  week2Data.forEach(item => {
    if (dataMap[item.name]) {
      dataMap[item.name][week2Label] = item[week2Label];
    } else {
      dataMap[item.name] = { ...item };
    }
  });
  
  // Sort by day index and hour
  return Object.values(dataMap).sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return a.hour - b.hour;
  });
};

/**
 * Custom hook for NR comparison data
 */
export const useNRComparisonData = () => {
  const [comparisonData, setComparisonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [week1Label, setWeek1Label] = useState('');
  const [week2Label, setWeek2Label] = useState('');

  const fetchComparisonData = useCallback(async (week1, week2, selectedKPIs) => {
    if (!week1 || !week2 || selectedKPIs.length === 0) {
      setComparisonData({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set week labels
      const w1Label = week1.label || 'Week 1';
      const w2Label = week2.label || 'Week 2';
      setWeek1Label(w1Label);
      setWeek2Label(w2Label);

      // Fetch data for both weeks
      const week1Start = week1.monday.toISOString().split('T')[0];
      const week1End = week1.sunday.toISOString().split('T')[0];
      const week2Start = week2.monday.toISOString().split('T')[0];
      const week2End = week2.sunday.toISOString().split('T')[0];

      const [week1Response, week2Response] = await Promise.all([
        axios.get(API_ENDPOINTS.nr.data, {
          params: { startDate: week1Start, endDate: week1End },
          headers: getAuthHeaders()
        }),
        axios.get(API_ENDPOINTS.nr.data, {
          params: { startDate: week2Start, endDate: week2End },
          headers: getAuthHeaders()
        })
      ]);

      const week1Data = week1Response.data.data || [];
      const week2Data = week2Response.data.data || [];

      // Process data for each selected KPI and frequency band
      const processedData = {};

      selectedKPIs.forEach(kpiId => {
        const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
        if (!kpiConfig) return;

        // Process for 900MHz
        const week1Data900 = formatComparisonData(week1Data, kpiConfig.column, '900MHz', w1Label, w2Label, true);
        const week2Data900 = formatComparisonData(week2Data, kpiConfig.column, '900MHz', w1Label, w2Label, false);
        const merged900 = mergeWeekData(week1Data900, week2Data900, w1Label, w2Label);

        // Process for 3500MHz
        const week1Data3500 = formatComparisonData(week1Data, kpiConfig.column, '3500MHz', w1Label, w2Label, true);
        const week2Data3500 = formatComparisonData(week2Data, kpiConfig.column, '3500MHz', w1Label, w2Label, false);
        const merged3500 = mergeWeekData(week1Data3500, week2Data3500, w1Label, w2Label);

        processedData[kpiId] = {
          '900MHz': merged900,
          '3500MHz': merged3500
        };
      });

      setComparisonData(processedData);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error fetching NR comparison data:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    comparisonData,
    loading,
    error,
    fetchComparisonData,
    week1Label,
    week2Label
  };
};
