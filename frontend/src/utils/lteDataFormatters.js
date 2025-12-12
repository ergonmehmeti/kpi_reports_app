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

/**
 * Prepare Integrity KPI data (DL PDCP Throughput)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for integrity throughput chart
 */
export const prepareIntegrityThroughputData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Average DL PDCP UE Throughput with CA (Mbps)': parseFloat(record.avg_dl_pdcp_ue_throughput_ca_mbps || 0).toFixed(2),
    'Average DL PDCP UE Throughput Overall (Mbps)': parseFloat(record.avg_dl_pdcp_ue_throughput_overall_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare Utilization KPI data (DL Traffic Volume)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for utilization stacked bar chart
 */
export const prepareUtilizationVolumeData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G DL PDCP Traffic Volume with CA (GB)': parseFloat(record.dl_pdcp_traffic_volume_ca_gb || 0).toFixed(2),
    '4G DL PDCP Traffic Volume without CA (GB)': parseFloat(record.dl_pdcp_traffic_volume_without_ca_gb || 0).toFixed(2)
  }));
};

/**
 * Prepare Traffic & Throughput Combined data (Dual-axis chart)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for combined traffic and throughput chart
 */
export const prepareTrafficThroughputCombinedData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G DL PDCP Traffic Volume with CA (GB)': parseFloat(record.dl_pdcp_traffic_volume_ca_gb || 0).toFixed(2),
    'Average DL PDCP UE Throughput with CA (Mbps)': parseFloat(record.avg_dl_pdcp_ue_throughput_ca_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare Traffic & Throughput Overall data (Dual-axis chart)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for overall traffic and throughput chart
 */
export const prepareTrafficThroughputOverallData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G DL PDCP Traffic Volume Overall (GB)': parseFloat(record.dl_pdcp_traffic_volume_overall_gb || 0).toFixed(2),
    'Average DL PDCP UE Throughput Overall (Mbps)': parseFloat(record.avg_dl_pdcp_ue_throughput_overall_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare UL Utilization KPI data (UL Traffic Volume)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for UL utilization stacked bar chart
 */
export const prepareULUtilizationVolumeData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G UL PDCP Traffic Volume with CA (GB)': parseFloat(record.ul_pdcp_traffic_volume_ca_gb || 0).toFixed(2),
    '4G UL PDCP Traffic Volume Overall (GB)': parseFloat(record.ul_pdcp_traffic_volume_overall_gb || 0).toFixed(2)
  }));
};

/**
 * Prepare UL Integrity KPI data (UL PDCP Throughput)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for UL integrity throughput chart
 */
export const prepareULIntegrityThroughputData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Average UL PDCP UE Throughput with CA (Mbps)': parseFloat(record.avg_ul_pdcp_ue_throughput_ca_mbps || 0).toFixed(2),
    'Average UL PDCP UE Throughput Overall (Mbps)': parseFloat(record.avg_ul_pdcp_ue_throughput_overall_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare Connected Users KPI data
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for connected users chart
 */
export const prepareConnectedUsersData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Connected LTE Users (Avg)': parseInt(record.connected_lte_users_avg || 0),
    'Connected LTE User (Max)': parseInt(record.connected_lte_users_max || 0)
  }));
};

/**
 * Prepare MAC Layer Throughput KPI data (Cell Level)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for MAC layer throughput chart with dual axis
 */
export const prepareMACThroughputData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Average DL MAC Cell Throughput (Mbps)': parseFloat(record.avg_dl_mac_cell_throughput_mbps || 0).toFixed(2),
    'Average UL MAC Cell Throughput (Mbps)': parseFloat(record.avg_ul_mac_cell_throughput_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare MAC Layer DL Traffic and Throughput data
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for DL MAC traffic volume and throughput chart
 */
export const prepareMACTrafficThroughputDLData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G DL MAC Traffic Volume (GB)': parseFloat(record.dl_mac_traffic_volume_gb || 0).toFixed(2),
    'Average DL MAC Cell Throughput (Mbps)': parseFloat(record.avg_dl_mac_cell_throughput_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare MAC Layer UL Traffic and Throughput data
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for UL MAC traffic volume and throughput chart
 */
export const prepareMACTrafficThroughputULData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G UL MAC Traffic Volume (GB)': parseFloat(record.ul_mac_traffic_volume_gb || 0).toFixed(2),
    'Average UL MAC Cell Throughput (Mbps)': parseFloat(record.avg_ul_mac_cell_throughput_mbps || 0).toFixed(2)
  }));
};

/**
 * Prepare Latency and Packet Loss data
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for DL latency and UL packet loss chart
 */
export const prepareLatencyPacketLossData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    'Downlink Latency (ms)': parseFloat(record.downlink_latency_ms || 0).toFixed(2),
    'Uplink Packet Loss (%)': parseFloat(record.uplink_packet_loss_pct || 0).toFixed(2)
  }));
};

/**
 * Prepare Total Traffic Volume data (DL and UL)
 * @param {Array} kpiData - Raw KPI data from API
 * @returns {Array} Formatted data for total traffic volume stacked bar chart
 */
export const prepareTotalTrafficVolumeData = (kpiData) => {
  return kpiData.map(record => ({
    name: formatDateTime(record.datetime),
    '4G DL PDCP Total Traffic Volume (GB)': parseFloat(record.dl_pdcp_traffic_volume_overall_gb || 0).toFixed(2),
    '4G UL PDCP Total Traffic Volume (GB)': parseFloat(record.ul_pdcp_traffic_volume_overall_gb || 0).toFixed(2)
  }));
};
