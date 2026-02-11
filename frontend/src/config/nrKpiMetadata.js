/**
 * NR KPI Metadata Configuration
 * Maps database field names to presentation names and descriptions for NR Reports
 */

export const nrKpiMetadata = {
  // ===================================================
  // Downlink KPIs
  // ===================================================
  
  'avg_dl_mac_drb_throughput_mbps': {
    displayName: 'Average Downlink User Data Throughput',
    description: 'The average speed at which users can download data through the network. It reflects the end-user experience of throughput at the cell level.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'downlink',
    visible: true
  },
  
  'normalized_avg_dl_mac_cell_throughput_traffic_mbps': {
    displayName: 'Normalized Average DL Cell Throughput (Traffic Slots)',
    description: 'Measures MAC layer downlink throughput normalized against active scheduling slots. Uses MAC PDU volume and PDSCH scheduling activity, accounting for CA and TDD patterns. Excludes slots without traffic.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'downlink',
    visible: true
  },
  
  'normalized_dl_mac_cell_throughput_actual_pdsch_mbps': {
    displayName: 'Normalized DL Cell Throughput (PDSCH Slots Only)',
    description: 'This KPI shows the average downlink throughput per cell during the time slots reserved for downlink traffic. It reflects the effective capacity available to users when the network is transmitting data, adjusted for the TDD pattern.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'downlink',
    visible: true
  },
  
  'pdsch_slot_utilization_pct': {
    displayName: 'Downlink Slot Usage Rate (Time Domain)',
    description: 'This KPI shows the percentage of available downlink time slots that are actually used to transmit user data. It reflects how much of the available capacity (TTI) is being used in downlink.',
    unit: '%',
    category: 'utilization',
    direction: 'downlink',
    visible: true
  },
  
  'dl_rbsym_utilization_pct': {
    displayName: 'Downlink Resource Usage Rate (Frequency Domain)',
    description: 'This KPI shows the percentage of available downlink radio resources that are actually used for carrying data and control signals. It reflects how much the cell is utilizing its spectrum capacity.',
    unit: '%',
    category: 'utilization',
    direction: 'downlink',
    visible: true
  },
  
  'percentage_unrestricted_volume_dl_pct': {
    displayName: 'Percentage of Unrestricted DL UE Data Volume',
    description: 'This KPI provides the percentage of DL data volume for UEs in the cell that is classified as unrestricted, i.e., when the volume is so low that all data can be transferred in one slot and no UE throughput sample could be calculated.',
    unit: '%',
    category: 'volume',
    direction: 'downlink',
    visible: true
  },
  
  'user_data_traffic_volume_dl_gb': {
    displayName: '5G User Data Traffic Volume on Downlink',
    description: 'This KPI represents User data traffic volume transmitted on downlink Data Radio Bearers (DRBs) over the 5G NR network, without counting protocol overhead or padding at MAC and PHY layer.',
    unit: 'GB',
    category: 'volume',
    direction: 'downlink',
    visible: true
  },
  
  // ===================================================
  // Uplink KPIs
  // ===================================================
  
  'avg_ul_mac_ue_throughput_mbps': {
    displayName: 'Average Uplink User Data Throughput',
    description: 'The average speed at which users can upload data through the network. It reflects the end-user experience of throughput at the cell level.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'uplink',
    visible: true
  },
  
  'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps': {
    displayName: 'Normalized Average UL Cell Throughput (Traffic Slots)',
    description: 'Measures MAC layer uplink throughput normalized against active scheduling slots. Uses MAC PDU volume and PUSCH scheduling activity, accounting for CA and TDD patterns. Excludes slots without traffic.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'uplink',
    visible: true
  },
  
  'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps': {
    displayName: 'Normalized UL Cell Throughput (PDSCH Slots Only)',
    description: 'This KPI shows the average uplink throughput per cell during the time slots reserved for uplink traffic. It reflects the effective capacity available to users when the network is transmitting data, adjusted for the TDD pattern.',
    unit: 'Mbps',
    category: 'throughput',
    direction: 'uplink',
    visible: true
  },
  
  'pusch_slot_utilization_pct': {
    displayName: 'Uplink Slot Usage Rate (Time Domain)',
    description: 'This KPI shows the percentage of available uplink time slots that are actually used to transmit user data. It reflects how much of the available capacity (TTI) is being used in uplink.',
    unit: '%',
    category: 'utilization',
    direction: 'uplink',
    visible: true
  },
  
  'ul_rbsym_utilization_pct': {
    displayName: 'Uplink Resource Usage Rate (Frequency Domain)',
    description: 'This KPI shows the percentage of available uplink radio resources that are actually used for carrying data and control signals. It reflects how much the cell is utilizing its spectrum capacity.',
    unit: '%',
    category: 'utilization',
    direction: 'uplink',
    visible: true
  },
  
  'percentage_unrestricted_volume_ul_pct': {
    displayName: 'Percentage of Unrestricted UL UE Data Volume',
    description: 'This KPI provides the percentage of UL data volume for UEs in the cell that is classified as unrestricted, i.e., when the volume is so low that all data can be transferred in one slot and no UE throughput sample could be calculated.',
    unit: '%',
    category: 'volume',
    direction: 'uplink',
    visible: true
  },
  
  'user_data_traffic_volume_ul_gb': {
    displayName: '5G User Data Traffic Volume on Uplink',
    description: 'This KPI represents user data volume successfully received on uplink Data Radio Bearers (DRBs) over the 5G NR network, without counting protocol overhead at MAC and PHY layer.',
    unit: 'GB',
    category: 'volume',
    direction: 'uplink',
    visible: true
  },
  
  // ===================================================
  // Cell Performance KPIs
  // ===================================================
  
  'partial_cell_availability_pct': {
    displayName: 'Cell Service Availability',
    description: 'Measures percentage of time availability, that is, time when a cell is available for service.',
    unit: '%',
    category: 'availability',
    visible: true
  },
  
  'ue_context_setup_success_rate_pct': {
    displayName: 'UE Context Setup Success Rate',
    description: 'Measures the success rate of UE context setups in the gNB-DU. This covers initial setups, incoming handovers and PSCell changes.',
    unit: '%',
    category: 'accessibility',
    visible: true
  },
  
  'random_access_success_rate_pct': {
    displayName: 'Connection Setup Success Rate (Random Access Phase)',
    description: 'Measures the probability of successful access in contention-based random access procedure.',
    unit: '%',
    category: 'accessibility',
    visible: true
  },
  
  // ===================================================
  // EN-DC Traffic KPIs
  // ===================================================
  
  'endc_total_traffic_volume_gb': {
    displayName: 'Amount of Traffic (GB) generated by 5G Users on LTE RAN',
    description: 'This KPI represents user data traffic volume generated by 5G EN-DC users that is transmitted over LTE radio network.',
    unit: 'GB',
    category: 'volume',
    direction: 'endc',
    visible: true
  },
  
  // ===================================================
  // EN-DC Setup & Mobility KPIs
  // ===================================================
  
  'endc_setup_success_rate': {
    displayName: '5G + LTE Dual Connectivity Setup Success Rate',
    description: 'This KPI shows how reliably users can establish a dual connection between 4G (LTE) and 5G (NR) when their devices first try to use both networks together.',
    unit: '%',
    category: 'accessibility',
    visible: true
  },
  
  'endc_intra_pscell_change_success_rate': {
    displayName: 'EN-DC Intra-sgNodeB PSCell Change Success Rate',
    description: 'Measures the success rate of PSCell changes within the same gNodeB in EN-DC mode.',
    unit: '%',
    category: 'mobility',
    visible: true
  },
  
  'endc_inter_pscell_change_success_rate': {
    displayName: '5G Secondary Inter-gNBCell Change Success Rate',
    description: 'This KPI shows how reliably a user\'s device can switch its secondary 5G cell while staying connected through dual connectivity (using both 4G and 5G together).',
    unit: '%',
    category: 'mobility',
    visible: true
  },
  
  // ===================================================
  // EN-DC Retainability KPIs
  // ===================================================
  
  'scg_retainability_endc_connectivity': {
    displayName: 'Dropped 5G Dual Connections',
    description: 'This KPI shows how reliably the network can keep a user\'s 5G secondary connection active when using dual connectivity (4G + 5G together). It measures how well 5G secondary connections are retained when devices use dual connectivity (4G+5G). Excludes normal mobility events (like successful PSCell changes) to show only abnormal drops.',
    unit: '%',
    category: 'retainability',
    visible: true
  },
  
  'scg_retainability_active': {
    displayName: 'SCG Active Radio Resource Retainability',
    description: 'SCG Active Radio Resource Retainability, Captured in gNodeB. Hidden from main reports - available in comparison mode only.',
    unit: '%',
    category: 'retainability',
    visible: false,  // Hidden - available in NR Compare only
    note: 'Not to show in web portal - available in NR Compare only'
  },
  
  'scg_retainability_overall': {
    displayName: 'SCG Radio Resource Retainability',
    description: 'SCG Radio Resource Retainability Captured in gNodeB. Hidden from main reports - available in comparison mode only.',
    unit: '%',
    category: 'retainability',
    visible: false,  // Hidden - available in NR Compare only
    note: 'Not to show in web portal - available in NR Compare only'
  },
  
  // ===================================================
  // RRC Connected Users KPIs
  // ===================================================
  
  'avg_rrc_connected_users': {
    displayName: 'Average 5G Connected Users with EN-DC',
    description: 'This KPI shows the average number of devices simultaneously connected to both 4G and 5G with or without ongoing user data transfer over 5G SCG radio resources.',
    unit: 'users',
    category: 'users',
    visible: true
  },
  
  'peak_rrc_connected_users': {
    displayName: 'Peak 5G Connected Users with EN-DC',
    description: 'This KPI shows the maximum number of devices simultaneously connected to both 4G and 5G with or without ongoing user data transfer over 5G SCG radio resources.',
    unit: 'users',
    category: 'users',
    visible: true
  },
  
  // ===================================================
  // Traffic Distribution & TOP Sites
  // ===================================================
  
  'share_5g_traffic_volume_by_band': {
    displayName: 'Share of 5G Traffic Volume (GB) per Frequency Band',
    description: 'Percentage distribution of traffic volume (DL + UL) per frequency band',
    unit: 'GB',
    category: 'volume',
    visible: true
  },
  
  'top_sites_total': {
    displayName: 'TOP Sites - Total (All Bands)',
    description: 'Top 20 sites by total traffic volume across all frequency bands',
    unit: 'GB',
    category: 'top_sites',
    visible: true
  },
  
  'top_sites_tdd': {
    displayName: 'TOP Sites - TDD (3500MHz)',
    description: 'Top 20 sites by traffic volume on 3500MHz (TDD) band',
    unit: 'GB',
    category: 'top_sites',
    visible: true
  },
  
  'top_sites_fdd': {
    displayName: 'TOP Sites - FDD (900MHz)',
    description: 'Top 20 sites by traffic volume on 900MHz (FDD) band',
    unit: 'GB',
    category: 'top_sites',
    visible: true
  }
};

/**
 * Helper function to get metadata for a KPI field
 * @param {string} kpiField - Database field name
 * @returns {object|null} KPI metadata or null if not found
 */
export const getKpiMetadata = (kpiField) => {
  return nrKpiMetadata[kpiField] || null;
};

/**
 * Helper function to get display name for a KPI field
 * @param {string} kpiField - Database field name
 * @returns {string} Display name or the original field name if not found
 */
export const getKpiDisplayName = (kpiField) => {
  const metadata = nrKpiMetadata[kpiField];
  return metadata ? metadata.displayName : kpiField;
};

/**
 * Helper function to get description for a KPI field
 * @param {string} kpiField - Database field name
 * @returns {string|null} Description or null if not found
 */
export const getKpiDescription = (kpiField) => {
  const metadata = nrKpiMetadata[kpiField];
  return metadata ? metadata.description : null;
};

/**
 * Get all visible KPIs
 * @returns {Array} Array of KPI field names that should be visible
 */
export const getVisibleKpis = () => {
  return Object.keys(nrKpiMetadata).filter(key => nrKpiMetadata[key].visible);
};

/**
 * Get KPIs by category
 * @param {string} category - Category name (throughput, utilization, volume, etc.)
 * @returns {Array} Array of KPI field names in that category
 */
export const getKpisByCategory = (category) => {
  return Object.keys(nrKpiMetadata).filter(
    key => nrKpiMetadata[key].category === category
  );
};

/**
 * Get KPIs by direction
 * @param {string} direction - Direction (downlink, uplink, endc)
 * @returns {Array} Array of KPI field names for that direction
 */
export const getKpisByDirection = (direction) => {
  return Object.keys(nrKpiMetadata).filter(
    key => nrKpiMetadata[key].direction === direction
  );
};

export default nrKpiMetadata;
