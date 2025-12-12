/**
 * LTE Data Formatters
 * Utility functions to format raw LTE KPI data for chart visualization
 */

/**
 * Format datetime to readable string
 * @param {string} datetime - ISO datetime string
 * @returns {string} Formatted datetime (e.g., "Dec 10, 03 PM")
 */
const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit' 
  });
};

/**
 * Prepare Availability KPI data
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for availability chart
 */
export const prepareAvailabilityData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Cell Availability (%)': parseFloat(record.cell_availability_pct || 0).toFixed(2),
    'Cell UnAvailability - Fault (%)': parseFloat(record.cell_unavailability_fault_pct || 0).toFixed(2),
    'Cell UnAvailability - Operation (%)': parseFloat(record.cell_unavailability_operation_pct || 0).toFixed(2)
  }));
};

/**
 * Prepare Accessibility KPI data (Connection Success)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for accessibility chart
 */
export const prepareAccessibilityData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'RRC Connection Establishment Success (%)': parseFloat(record.rrc_connection_success_pct || 0).toFixed(2),
    'S1 Connection Establishment Success (%)': parseFloat(record.s1_connection_success_pct || 0).toFixed(2),
    'E-RAB Only Establishment Success (%)': parseFloat(record.erab_only_establishment_success_pct || 0).toFixed(2),
    'Initial E-RAB Establishment Success (%)': parseFloat(record.initial_erab_establishment_success_pct || 0).toFixed(2)
  }));
};

/**
 * Prepare Mobility KPI data (Handover Success)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for mobility chart
 */
export const prepareMobilityData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Handover Success Ratio (%)': parseFloat(record.handover_success_ratio_pct || 0).toFixed(2),
    'Handover Execution Success (%)': parseFloat(record.handover_execution_success_pct || 0).toFixed(2),
    'Handover Preparation Success (%)': parseFloat(record.handover_preparation_success_pct || 0).toFixed(2)
  }));
};

/**
 * Prepare Retainability KPI data - Drop Ratios (%)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for retainability drop ratio chart
 */
export const prepareRetainabilityDropRatioData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'E-RAB Drop Ratio-Overall (%)': parseFloat(record.erab_drop_ratio_overall_pct || 0).toFixed(2),
    'E-RAB Drop due to MME (%)': parseFloat(record.erab_drop_mme_pct || 0).toFixed(2),
    'E-RAB Drop due to eNB (%)': parseFloat(record.erab_drop_enb_pct || 0).toFixed(2)
  }));
};

/**
 * Prepare Retainability KPI data - Drops per Hour
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for retainability drops per hour chart
 */
export const prepareRetainabilityDropsPerHourData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'E-RAB Drops per Hour (Overall)': parseFloat(record.erab_drops_per_hour_overall || 0).toFixed(2),
    'E-RAB Drops per Hour due to MME': parseFloat(record.erab_drops_per_hour_mme || 0).toFixed(2),
    'E-RAB Drops per Hour due to eNB': parseFloat(record.erab_drops_per_hour_enb || 0).toFixed(2)
  }));
};
