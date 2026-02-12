/**
 * LTE KPI Metadata Configuration
 * Maps KPI identifiers to presentation names and descriptions for LTE Reports
 */

export const lteKpiMetadata = {
  // ===================================================
  // Availability & Accessibility KPIs
  // ===================================================
  
  'availability_metrics': {
    displayName: 'Availability Metrics',
    description: 'Availability Metrics',
    category: 'availability',
    visible: true
  },
  
  'connection_establishment_success_rates': {
    displayName: 'Connection Establishment Success Rates',
    description: 'Connection Establishment Success Rates',
    category: 'accessibility',
    visible: true
  },
  
  // ===================================================
  // Mobility & Retainability KPIs
  // ===================================================
  
  'handover_success_metrics': {
    displayName: 'Handover Success Metrics',
    description: 'Handover Success Metrics',
    category: 'mobility',
    visible: true
  },
  
  'erab_drop_ratio': {
    displayName: 'Proportions of Abnormal E-RAB Releases over Total E-RAB Releases',
    description: 'Proportions of Abnormal E-RAB Releases over Total E-RAB Releases',
    category: 'retainability',
    visible: true
  },
  
  // ===================================================
  // Downlink Traffic & Throughput KPIs
  // ===================================================
  
  'dl_pdcp_ue_throughput': {
    displayName: 'Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface',
    description: 'Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface',
    category: 'integrity',
    direction: 'downlink',
    visible: true
  },
  
  'dl_pdcp_traffic_volume_ca': {
    displayName: 'Utilization - LTE Data Traffic Volume transferred on DL direction with and without using Carrier Aggregation',
    description: 'Utilization - LTE Data Traffic Volume transferred on DL direction with and without using Carrier Aggregation',
    category: 'utilization',
    direction: 'downlink',
    visible: true
  },
  
  'traffic_throughput_ca_only': {
    displayName: 'Traffic and Throughput for UEs using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network',
    description: 'Traffic and Throughput for UEs using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network',
    category: 'traffic',
    direction: 'downlink',
    visible: true
  },
  
  'traffic_throughput_overall': {
    displayName: 'Traffic and Throughput for UEs with and without using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network',
    description: 'Traffic and Throughput for UEs with and without using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network',
    category: 'traffic',
    direction: 'downlink',
    visible: true
  },
  
  // ===================================================
  // Uplink Traffic & Throughput KPIs
  // ===================================================
  
  'ul_pdcp_traffic_volume_ca': {
    displayName: 'Utilization - LTE Data Traffic Volume transferred on UL direction used for UL PDCP UE throughput calculation - Overall traffic volume and amount of traffic using Carrier Aggregation (CA) on UL',
    description: 'Utilization - LTE Data Traffic Volume transferred on UL direction used for UL PDCP UE throughput calculation - Overall traffic volume and amount of traffic using Carrier Aggregation (CA) on UL',
    category: 'utilization',
    direction: 'uplink',
    visible: true
  },
  
  'ul_pdcp_ue_throughput': {
    displayName: 'Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface (UL direction)',
    description: 'Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface (UL direction)',
    category: 'integrity',
    direction: 'uplink',
    visible: true
  },
  
  // ===================================================
  // Connected Users KPIs
  // ===================================================
  
  'connected_users': {
    displayName: 'Utilization KPIs - Number of LTE UEs on \'Connected State\' - Connected means there is signaling connection between UE and Network. Signaling Connection is made up of 2 parts: RRC Connection (UE<->eNB) and S1_MME (eNB<->MME) Connection',
    description: 'Utilization KPIs - Number of LTE UEs on \'Connected State\' - Connected means there is signaling connection between UE and Network. Signaling Connection is made up of 2 parts: RRC Connection (UE<->eNB) and S1_MME (eNB<->MME) Connection',
    category: 'utilization',
    visible: true
  },
  
  // ===================================================
  // MAC Layer KPIs
  // ===================================================
  
  'mac_throughput_dl_ul': {
    displayName: 'Integrity KPIs - Downlink and Uplink Throughput for Cell Level measured at MAC layer',
    description: 'Integrity KPIs - Downlink and Uplink Throughput for Cell Level measured at MAC layer',
    category: 'integrity',
    visible: true
  },
  
  'mac_throughput_traffic_dl': {
    displayName: 'Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Downlink direction',
    description: 'Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Downlink direction',
    category: 'integrity',
    direction: 'downlink',
    visible: true
  },
  
  'mac_throughput_traffic_ul': {
    displayName: 'Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Uplink direction',
    description: 'Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Uplink direction',
    category: 'integrity',
    direction: 'uplink',
    visible: true
  },
  
  // ===================================================
  // Latency & Packet Loss KPIs
  // ===================================================
  
  'latency_packet_loss': {
    displayName: 'Integrity KPIs - DL Latency and UL Packet Loss - DL Latency indicates how long it takes to transmit the first packet on Air Interface from the time it was received on eNB. UL Packet Loss measures proportion of packets that have lost on Air interface in Uplink direction',
    description: 'Integrity KPIs - DL Latency and UL Packet Loss - DL Latency indicates how long it takes to transmit the first packet on Air Interface from the time it was received on eNB. UL Packet Loss measures proportion of packets that have lost on Air interface in Uplink direction',
    category: 'integrity',
    visible: true
  },
  
  // ===================================================
  // Total Traffic Volume KPIs
  // ===================================================
  
  'total_traffic_volume': {
    displayName: 'Utilization - LTE Total Data Traffic Volume transferred on DL and UL direction - The metric shows the total volume of PDCP SDUs on Data Radio Bearers that have been transferred in DL and UL',
    description: 'Utilization - LTE Total Data Traffic Volume transferred on DL and UL direction - The metric shows the total volume of PDCP SDUs on Data Radio Bearers that have been transferred in DL and UL',
    category: 'utilization',
    visible: true
  },
  
  // ===================================================
  // Site Traffic KPIs
  // ===================================================
  
  'top_20_sites': {
    displayName: 'Top 20 Sites by LTE Traffic Volume (DL/UL)',
    description: 'Top 20 Sites by LTE Traffic Volume (DL/UL)',
    category: 'site_traffic',
    visible: true
  },
  
  'bottom_20_sites': {
    displayName: 'Bottom 20 Sites by LTE Traffic Volume (DL/UL)',
    description: 'Bottom 20 Sites by LTE Traffic Volume (DL/UL)',
    category: 'site_traffic',
    visible: true
  },
  
  // ===================================================
  // Frequency Band Traffic
  // ===================================================
  
  'frequency_band_traffic': {
    displayName: 'LTE Traffic Distribution by Frequency Band',
    description: 'LTE Traffic Distribution by Frequency Band',
    category: 'frequency',
    visible: true
  }
};

/**
 * Helper function to get metadata for a KPI field
 * @param {string} kpiField - KPI identifier
 * @returns {object|null} KPI metadata or null if not found
 */
export const getLteKpiMetadata = (kpiField) => {
  return lteKpiMetadata[kpiField] || null;
};

/**
 * Helper function to get display name for a KPI field
 * @param {string} kpiField - KPI identifier
 * @returns {string} Display name or the original field name if not found
 */
export const getLteKpiDisplayName = (kpiField) => {
  const metadata = lteKpiMetadata[kpiField];
  return metadata ? metadata.displayName : kpiField;
};

/**
 * Helper function to get description for a KPI field
 * @param {string} kpiField - KPI identifier
 * @returns {string|null} Description or null if not found
 */
export const getLteKpiDescription = (kpiField) => {
  const metadata = lteKpiMetadata[kpiField];
  return metadata ? metadata.description : null;
};

/**
 * Get all visible KPIs
 * @returns {Array} Array of KPI field names that should be visible
 */
export const getVisibleLteKpis = () => {
  return Object.keys(lteKpiMetadata).filter(key => lteKpiMetadata[key].visible);
};

/**
 * Get KPIs by category
 * @param {string} category - Category name (availability, accessibility, mobility, etc.)
 * @returns {Array} Array of KPI field names in that category
 */
export const getLteKpisByCategory = (category) => {
  return Object.keys(lteKpiMetadata).filter(
    key => lteKpiMetadata[key].category === category
  );
};

/**
 * Get KPIs by direction
 * @param {string} direction - Direction (downlink, uplink)
 * @returns {Array} Array of KPI field names for that direction
 */
export const getLteKpisByDirection = (direction) => {
  return Object.keys(lteKpiMetadata).filter(
    key => lteKpiMetadata[key].direction === direction
  );
};

export default lteKpiMetadata;
