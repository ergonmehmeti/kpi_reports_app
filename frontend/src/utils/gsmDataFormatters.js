/**
 * Data formatting utilities for GSM KPI data
 */

/**
 * Format hourly data for a specific KPI
 * @param {Array} data - Raw API data
 * @param {string} columnName - Database column name
 * @param {string} displayName - Display name for the chart
 * @returns {Array} Formatted data for charts
 */
const formatHourlyKPI = (data, columnName, displayName) => {
  return data.map(item => ({
    name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
    [displayName]: parseFloat(item[columnName] || 0).toFixed(2),
  }));
};

/**
 * Format all GSM KPI data from API response
 * @param {Array} hourlyData - Hourly KPI data from API
 * @param {Array} dailyData - Daily aggregate data from API
 * @returns {Object} Formatted data object with all KPIs
 */
export const formatGSMData = (hourlyData, dailyData) => {
  const formatted = {
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
  };

  if (hourlyData && hourlyData.length > 0) {
    formatted.successRate = formatHourlyKPI(hourlyData, 'tch_assignment_success_rate', 'Success Rate');
    formatted.congestion = formatHourlyKPI(hourlyData, 'subscriber_tch_congestion', 'Congestion');
    formatted.trafficVolume = formatHourlyKPI(hourlyData, 'tch_traffic_volume', 'Traffic Volume');
    formatted.cellAvailability = formatHourlyKPI(hourlyData, 'cell_availability', 'Availability');
    formatted.sdcchCongestion = formatHourlyKPI(hourlyData, 'sdcch_congestion', 'SDCCH Congestion');
    formatted.sdcchDropRate = formatHourlyKPI(hourlyData, 'sdcch_drop_rate', 'SDCCH Drop Rate');
    formatted.callDropRate = formatHourlyKPI(hourlyData, 'call_drop_rate', 'Call Drop Rate');
    formatted.callMinutesPerDrop = formatHourlyKPI(hourlyData, 'call_minutes_per_drop', 'Minutes per Drop');
    formatted.handoverSuccess = formatHourlyKPI(hourlyData, 'handover_success_rate', 'Handover Success');
    formatted.handoverDropRate = formatHourlyKPI(hourlyData, 'handover_drop_rate', 'Handover Drop Rate');
    formatted.voiceQuality = formatHourlyKPI(hourlyData, 'good_voice_qual_ratio_ul', 'Voice Quality');
  }

  if (dailyData && dailyData.length > 0) {
    formatted.dailyTrafficVolume = dailyData.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Traffic Volume': parseFloat(item.total_tch_traffic_volume || 0).toFixed(2),
    }));
  }

  return formatted;
};
