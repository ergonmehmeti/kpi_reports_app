import { useState, useCallback } from 'react';
import { getKPIData } from '../services/api';

/**
 * Custom hook for fetching and comparing GSM KPI data between two weeks
 * @returns {Object} Comparison data state, loading state, error state, and fetch function
 */
export const useGSMComparisonData = () => {
  const [comparisonData, setComparisonData] = useState({
    trafficVolume: [],
    cellAvailability: [],
    voiceQuality: [],
    sdcchCongestion: [],
    sdcchDropRate: [],
    successRate: [],
    congestion: [],
    callDropRate: [],
    callMinutesPerDrop: [],
    handoverSuccess: [],
    handoverDropRate: [],
    week1Label: '',
    week2Label: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Format hourly data for comparison with normalized day labels
   * @param {Array} data - Raw API data
   * @param {string} columnName - Database column name
   * @param {string} dataKeyName - Name for the data key in chart
   * @returns {Array} Formatted data with normalized day labels
   */
  const formatComparisonKPI = (data, columnName, dataKeyName) => {
    // Sort by date and hour to ensure correct order
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.hour - b.hour;
    });

    // Get the first date to calculate day numbers
    const firstDate = sortedData.length > 0 ? new Date(sortedData[0].date) : null;
    
    return sortedData.map(item => {
      const itemDate = new Date(item.date);
      const dayDiff = Math.floor((itemDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
      const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayName = dayNames[dayDiff] || `Day${dayDiff}`;
      
      return {
        name: `${dayName} ${item.hour}:00`,
        dayIndex: dayDiff,
        hour: item.hour,
        [dataKeyName]: parseFloat(item[columnName] || 0).toFixed(2),
      };
    });
  };

  /**
   * Merge two weeks' data into a single dataset for the chart
   * @param {Array} week1Data - Formatted data from week 1
   * @param {Array} week2Data - Formatted data from week 2
   * @param {string} week1Key - Data key name for week 1
   * @param {string} week2Key - Data key name for week 2
   * @returns {Array} Merged data for dual-line chart
   */
  const mergeWeeksData = (week1Data, week2Data, week1Key, week2Key) => {
    const merged = [];
    const maxLength = Math.max(week1Data.length, week2Data.length);

    for (let i = 0; i < maxLength; i++) {
      const w1 = week1Data[i] || {};
      const w2 = week2Data[i] || {};
      
      merged.push({
        name: w1.name || w2.name || `Point ${i}`,
        [week1Key]: w1[week1Key] || null,
        [week2Key]: w2[week2Key] || null,
      });
    }

    return merged;
  };

  /**
   * Format and merge a specific KPI for both weeks
   */
  const formatAndMergeKPI = (week1Data, week2Data, columnName, week1Label, week2Label) => {
    const week1Formatted = formatComparisonKPI(week1Data, columnName, week1Label);
    const week2Formatted = formatComparisonKPI(week2Data, columnName, week2Label);
    return mergeWeeksData(week1Formatted, week2Formatted, week1Label, week2Label);
  };

  const fetchComparisonData = useCallback(async (week1, week2) => {
    try {
      setLoading(true);
      setError(null);

      const week1Start = week1.monday.toISOString().split('T')[0];
      const week1End = week1.sunday.toISOString().split('T')[0];
      const week2Start = week2.monday.toISOString().split('T')[0];
      const week2End = week2.sunday.toISOString().split('T')[0];

      // Fetch both weeks in parallel
      const [week1Response, week2Response] = await Promise.all([
        getKPIData('gsm', { startDate: week1Start, endDate: week1End }),
        getKPIData('gsm', { startDate: week2Start, endDate: week2End }),
      ]);

      if (!week1Response.data?.length || !week2Response.data?.length) {
        setError('No data available for one or both weeks. Please ensure data is imported.');
        return;
      }

      // Create labels for the weeks
      const week1Label = `Week ${week1.weekOfYear}`;
      const week2Label = `Week ${week2.weekOfYear}`;

      // Format and merge all KPIs
      setComparisonData({
        trafficVolume: formatAndMergeKPI(week1Response.data, week2Response.data, 'tch_traffic_volume', week1Label, week2Label),
        cellAvailability: formatAndMergeKPI(week1Response.data, week2Response.data, 'cell_availability', week1Label, week2Label),
        voiceQuality: formatAndMergeKPI(week1Response.data, week2Response.data, 'good_voice_qual_ratio_ul', week1Label, week2Label),
        sdcchCongestion: formatAndMergeKPI(week1Response.data, week2Response.data, 'sdcch_congestion', week1Label, week2Label),
        sdcchDropRate: formatAndMergeKPI(week1Response.data, week2Response.data, 'sdcch_drop_rate', week1Label, week2Label),
        successRate: formatAndMergeKPI(week1Response.data, week2Response.data, 'tch_assignment_success_rate', week1Label, week2Label),
        congestion: formatAndMergeKPI(week1Response.data, week2Response.data, 'subscriber_tch_congestion', week1Label, week2Label),
        callDropRate: formatAndMergeKPI(week1Response.data, week2Response.data, 'call_drop_rate', week1Label, week2Label),
        callMinutesPerDrop: formatAndMergeKPI(week1Response.data, week2Response.data, 'call_minutes_per_drop', week1Label, week2Label),
        handoverSuccess: formatAndMergeKPI(week1Response.data, week2Response.data, 'handover_success_rate', week1Label, week2Label),
        handoverDropRate: formatAndMergeKPI(week1Response.data, week2Response.data, 'handover_drop_rate', week1Label, week2Label),
        week1Label,
        week2Label,
      });

    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError('Failed to load comparison data. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    comparisonData,
    loading,
    error,
    fetchComparisonData,
  };
};
